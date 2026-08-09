from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.promo import Offer


def _aware(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def _offer_active(offer: Offer, now: datetime) -> bool:
    if not offer.is_active or offer.discount_percent is None:
        return False
    starts = _aware(offer.starts_at)
    ends = _aware(offer.ends_at)
    if starts and now < starts:
        return False
    if ends and now > ends:
        return False
    return True


def get_active_offers(db: Session) -> list[Offer]:
    now = datetime.now(timezone.utc)
    offers = db.query(Offer).filter(Offer.is_active.is_(True)).all()
    return [o for o in offers if _offer_active(o, now)]


def resolve_discount(product: Product, offers: list[Offer] | None = None) -> tuple[Decimal, Decimal | None, str | None]:
    """Return (sale_price, applied_percent, source_label)."""
    base = Decimal(product.price)
    best_pct: Decimal | None = None
    source: str | None = None

    if product.discount_percent is not None and Decimal(product.discount_percent) > 0:
        best_pct = Decimal(product.discount_percent)
        source = "product"

    if product.category is not None and product.category.discount_percent is not None:
        cat_pct = Decimal(product.category.discount_percent)
        if cat_pct > 0 and (best_pct is None or cat_pct > best_pct):
            best_pct = cat_pct
            source = "category"

    for offer in offers or []:
        if not offer.discount_percent:
            continue
        applies = False
        if offer.product_id and offer.product_id == product.id:
            applies = True
        elif offer.category_id and product.category_id and offer.category_id == product.category_id:
            applies = True
        if applies:
            offer_pct = Decimal(offer.discount_percent)
            if best_pct is None or offer_pct > best_pct:
                best_pct = offer_pct
                source = "offer"

    if best_pct is None:
        return base, None, None

    sale = (base * (Decimal("100") - best_pct) / Decimal("100")).quantize(Decimal("0.01"))
    return sale, best_pct, source


def serialize_product(product: Product, offers: list[Offer] | None = None, *, detail: bool = False) -> dict:
    sale_price, pct, source = resolve_discount(product, offers)
    images = [
        {"id": i.id, "url": i.url, "alt": i.alt, "sort_order": i.sort_order}
        for i in sorted(product.images or [], key=lambda x: x.sort_order)
    ]
    category = None
    if product.category:
        category = {
            "id": product.category.id,
            "name": product.category.name,
            "slug": product.category.slug,
            "description": product.category.description,
            "discount_percent": product.category.discount_percent,
            "image_url": getattr(product.category, "image_url", None),
        }

    threshold = getattr(product, "low_stock_threshold", 10) or 10
    data = {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "short_description": product.short_description,
        "price": product.price,
        "sale_price": sale_price,
        "compare_at_price": product.compare_at_price,
        "discount_percent": product.discount_percent,
        "applied_discount_percent": pct,
        "discount_source": source,
        "is_featured": product.is_featured,
        "is_active": product.is_active,
        "stock": product.stock,
        "low_stock_threshold": threshold,
        "is_low_stock": product.stock <= threshold,
        "concerns": product.concerns,
        "skin_types": product.skin_types,
        "category": category,
        "images": images,
    }
    if detail:
        data.update(
            {
                "description": product.description,
                "ingredients": product.ingredients,
                "results_timeline": product.results_timeline,
                "variants": [
                    {
                        "id": v.id,
                        "name": v.name,
                        "sku": v.sku,
                        "price_override": v.price_override,
                        "stock": v.stock,
                    }
                    for v in (product.variants or [])
                ],
                "reviews": [
                    {
                        "id": r.id,
                        "rating": r.rating,
                        "title": r.title,
                        "body": r.body,
                        "created_at": r.created_at,
                        "user_name": r.user.full_name if r.user else getattr(r, "guest_name", None),
                        "review_type": getattr(r, "review_type", None) or "product",
                        "product_id": r.product_id,
                        "product_name": None,
                        "discovery_source": getattr(r, "discovery_source", None),
                    }
                    for r in (product.reviews or [])
                    if (getattr(r, "review_type", None) or "product") == "product"
                ],
            }
        )
    return data


def effective_unit_price(product: Product, variant_id: int | None, offers: list[Offer] | None = None) -> Decimal:
    sale, _, _ = resolve_discount(product, offers)
    if variant_id:
        variant = next((v for v in (product.variants or []) if v.id == variant_id), None)
        if variant and variant.price_override is not None:
            # variant override still respects discount percent on that override
            base = Decimal(variant.price_override)
            _, pct, _ = resolve_discount(product, offers)
            if pct:
                return (base * (Decimal("100") - pct) / Decimal("100")).quantize(Decimal("0.01"))
            return base
    return sale
