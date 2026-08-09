from pathlib import Path
import uuid
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.core.deps import get_admin_user
from app.db.session import get_db
from app.models.category import Category
from app.models.order import Order
from app.models.product import Product, ProductImage, ProductVariant
from app.models.promo import Offer, PromoCode
from app.models.review import Review
from app.models.user import User
from app.schemas.admin import (
    CategoryIn,
    DashboardOut,
    LowStockAlert,
    OrderStatusIn,
    ProductAdminIn,
    RevenuePeriodOut,
    ReviewHomeToggle,
)
from app.schemas.order import OrderOut
from app.schemas.product import CategoryOut, ProductDetailOut, ReviewOut
from app.schemas.promo import OfferIn, OfferOut, PromoCodeIn, PromoCodeOut
from app.schemas.site_settings import SiteSettingsIn, SiteSettingsOut, serialize_settings, _clean
from app.schemas.content_card import (
    ALLOWED_PAGE_KEYS,
    ALLOWED_LAYOUTS,
    PAGE_SECTIONS,
    CARD_LAYOUTS,
    ContentCardIn,
    ContentCardOut,
)
from app.services import pricing
from app.utils.helpers import slugify
from app.api.v1.routes.reviews import _serialize as serialize_review
from app.models.content_card import ContentCard

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parents[4] / "uploads" / "products"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _ensure_slug(value: str) -> str:
    return slugify(value) if value else value


def _store_tz():
    """Store timezone for revenue day boundaries. Falls back to fixed UTC+5 on Windows without tzdata."""
    try:
        return ZoneInfo(settings.STORE_TIMEZONE)
    except Exception:
        try:
            return ZoneInfo("Asia/Karachi")
        except Exception:
            return timezone(timedelta(hours=5))


def _product_out(db: Session, product_id: int) -> dict:
    product = (
        db.query(Product)
        .options(
            joinedload(Product.images),
            joinedload(Product.variants),
            joinedload(Product.category),
            joinedload(Product.reviews),
        )
        .filter(Product.id == product_id)
        .first()
    )
    offers = pricing.get_active_offers(db)
    return pricing.serialize_product(product, offers, detail=True)


def _day_start(d: date, tz) -> datetime:
    """Start of calendar day in store timezone (as aware datetime)."""
    return datetime(d.year, d.month, d.day, tzinfo=tz)


def _revenue_sum(db: Session, start: datetime | None = None, end: datetime | None = None) -> float:
    q = db.query(func.coalesce(func.sum(Order.total), 0)).filter(Order.status != "cancelled")
    if start is not None:
        q = q.filter(Order.created_at >= start)
    if end is not None:
        q = q.filter(Order.created_at < end)
    return float(q.scalar() or 0)


def _order_count(db: Session, start: datetime | None = None, end: datetime | None = None) -> int:
    q = db.query(func.count(Order.id)).filter(Order.status != "cancelled")
    if start is not None:
        q = q.filter(Order.created_at >= start)
    if end is not None:
        q = q.filter(Order.created_at < end)
    return int(q.scalar() or 0)


def _revenue_breakdown(
    db: Session,
    custom_from: date | None = None,
    custom_to: date | None = None,
) -> RevenuePeriodOut:
    tz = _store_tz()
    now = datetime.now(tz)
    today = now.date()
    week_start = _day_start(today - timedelta(days=today.weekday()), tz)
    month_start = _day_start(date(today.year, today.month, 1), tz)
    year_start = _day_start(date(today.year, 1, 1), tz)
    today_start = _day_start(today, tz)
    tomorrow_start = _day_start(today + timedelta(days=1), tz)

    custom = None
    custom_orders = None
    custom_from_s = None
    custom_to_s = None
    if custom_from or custom_to:
        start_d = custom_from or custom_to
        end_d = custom_to or custom_from
        if start_d and end_d and end_d < start_d:
            start_d, end_d = end_d, start_d
        start_dt = _day_start(start_d, tz) if start_d else None
        end_dt = _day_start(end_d + timedelta(days=1), tz) if end_d else None
        custom = _revenue_sum(db, start_dt, end_dt)
        custom_orders = _order_count(db, start_dt, end_dt)
        custom_from_s = start_d.isoformat() if start_d else None
        custom_to_s = end_d.isoformat() if end_d else None

    return RevenuePeriodOut(
        today=_revenue_sum(db, today_start, tomorrow_start),
        week=_revenue_sum(db, week_start),
        month=_revenue_sum(db, month_start),
        year=_revenue_sum(db, year_start),
        all_time=_revenue_sum(db),
        custom=custom,
        custom_from=custom_from_s,
        custom_to=custom_to_s,
        custom_orders=custom_orders,
    )


@router.get("/dashboard", response_model=DashboardOut)
def dashboard(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    products = db.query(Product).all()
    alerts = [
        LowStockAlert(
            id=p.id,
            name=p.name,
            slug=p.slug,
            stock=p.stock,
            low_stock_threshold=getattr(p, "low_stock_threshold", 10) or 10,
        )
        for p in products
        if p.stock <= (getattr(p, "low_stock_threshold", 10) or 10)
    ]
    breakdown = _revenue_breakdown(db)
    return DashboardOut(
        products=len(products),
        categories=db.query(Category).count(),
        orders=db.query(Order).count(),
        users=db.query(User).count(),
        revenue=breakdown.all_time,
        revenue_breakdown=breakdown,
        active_promos=db.query(PromoCode).filter(PromoCode.is_active.is_(True)).count(),
        active_offers=db.query(Offer).filter(Offer.is_active.is_(True)).count(),
        low_stock_count=len(alerts),
        low_stock_alerts=alerts,
    )


@router.get("/revenue", response_model=RevenuePeriodOut)
def revenue_report(
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
    from_date: date | None = Query(None, alias="from"),
    to_date: date | None = Query(None, alias="to"),
):
    return _revenue_breakdown(db, custom_from=from_date, custom_to=to_date)


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    _: User = Depends(get_admin_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only image uploads are allowed")
    ext = Path(file.filename or "photo.jpg").suffix.lower() or ".jpg"
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        ext = ".jpg"
    name = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / name
    content = await file.read()
    dest.write_bytes(content)
    path = f"/uploads/products/{name}"
    from app.services.pricing import absolute_media

    return {"url": absolute_media(path) or path}



# ---- Categories ----
@router.get("/categories", response_model=list[CategoryOut])
def admin_categories(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name).all()


@router.post("/categories", response_model=CategoryOut)
def create_category(payload: CategoryIn, _: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    slug = _ensure_slug(payload.slug or payload.name)
    if db.query(Category).filter(Category.slug == slug).first():
        raise HTTPException(400, "Category slug already exists")
    cat = Category(
        name=payload.name,
        slug=slug,
        description=payload.description,
        discount_percent=payload.discount_percent,
        image_url=payload.image_url,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/categories/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    payload: CategoryIn,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    cat = db.get(Category, category_id)
    if not cat:
        raise HTTPException(404, "Category not found")
    cat.name = payload.name
    cat.slug = _ensure_slug(payload.slug or payload.name)
    cat.description = payload.description
    cat.discount_percent = payload.discount_percent
    cat.image_url = payload.image_url
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/categories/{category_id}")
def delete_category(category_id: int, _: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    cat = db.get(Category, category_id)
    if not cat:
        raise HTTPException(404, "Category not found")
    db.delete(cat)
    db.commit()
    return {"message": "deleted"}


# ---- Products ----
@router.get("/products", response_model=list[ProductDetailOut])
def admin_products(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    products = (
        db.query(Product)
        .options(
            joinedload(Product.images),
            joinedload(Product.category),
            joinedload(Product.variants),
            joinedload(Product.reviews),
        )
        .order_by(Product.id.desc())
        .all()
    )
    offers = pricing.get_active_offers(db)
    return [pricing.serialize_product(p, offers, detail=True) for p in products]


@router.post("/products", response_model=ProductDetailOut)
def create_product(payload: ProductAdminIn, _: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    slug = _ensure_slug(payload.slug or payload.name)
    if db.query(Product).filter(Product.slug == slug).first():
        raise HTTPException(400, "Product slug already exists")
    product = Product(
        name=payload.name,
        slug=slug,
        short_description=payload.short_description,
        description=payload.description,
        price=payload.price,
        compare_at_price=payload.compare_at_price,
        discount_percent=payload.discount_percent,
        category_id=payload.category_id,
        concerns=payload.concerns,
        ingredients=payload.ingredients,
        results_timeline=payload.results_timeline,
        skin_types=payload.skin_types,
        is_featured=payload.is_featured,
        is_active=payload.is_active,
        stock=payload.stock,
        low_stock_threshold=payload.low_stock_threshold or 10,
    )
    db.add(product)
    db.flush()
    for i, url in enumerate(payload.image_urls):
        if url.strip():
            db.add(ProductImage(product_id=product.id, url=url.strip(), alt=payload.name, sort_order=i))
    sku = payload.variant_sku or f"FOL-{product.id:04d}"
    db.add(
        ProductVariant(
            product_id=product.id,
            name=payload.variant_name or "Standard",
            sku=sku,
            stock=payload.stock,
        )
    )
    db.commit()
    return _product_out(db, product.id)


@router.put("/products/{product_id}", response_model=ProductDetailOut)
def update_product(
    product_id: int,
    payload: ProductAdminIn,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    product.name = payload.name
    product.slug = _ensure_slug(payload.slug or payload.name)
    product.short_description = payload.short_description
    product.description = payload.description
    product.price = payload.price
    product.compare_at_price = payload.compare_at_price
    product.discount_percent = payload.discount_percent
    product.category_id = payload.category_id
    product.concerns = payload.concerns
    product.ingredients = payload.ingredients
    product.results_timeline = payload.results_timeline
    product.skin_types = payload.skin_types
    product.is_featured = payload.is_featured
    product.is_active = payload.is_active
    product.stock = payload.stock
    product.low_stock_threshold = payload.low_stock_threshold or 10

    if payload.image_urls is not None:
        for img in list(product.images):
            db.delete(img)
        db.flush()
        for i, url in enumerate(payload.image_urls):
            if url.strip():
                db.add(ProductImage(product_id=product.id, url=url.strip(), alt=payload.name, sort_order=i))

    db.commit()
    return _product_out(db, product_id)


@router.delete("/products/{product_id}")
def delete_product(product_id: int, _: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    db.delete(product)
    db.commit()
    return {"message": "deleted"}


# ---- Orders ----
@router.get("/orders", response_model=list[OrderOut])
def admin_orders(
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
    from_date: date | None = Query(None, description="Inclusive start date (store timezone)"),
    to_date: date | None = Query(None, description="Inclusive end date (store timezone)"),
):
    tz = _store_tz()
    q = db.query(Order).options(joinedload(Order.items))

    if from_date or to_date:
        start_d = from_date or to_date
        end_d = to_date or from_date
        if start_d and end_d and end_d < start_d:
            start_d, end_d = end_d, start_d
        if start_d:
            q = q.filter(Order.created_at >= _day_start(start_d, tz))
        if end_d:
            q = q.filter(Order.created_at < _day_start(end_d + timedelta(days=1), tz))

    return q.order_by(Order.created_at.desc()).all()


@router.patch("/orders/{order_id}", response_model=OrderOut)
def update_order_status(
    order_id: int,
    payload: OrderStatusIn,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order


# ---- Promo codes ----
@router.get("/promos", response_model=list[PromoCodeOut])
def list_promos(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(PromoCode).order_by(PromoCode.id.desc()).all()


@router.post("/promos", response_model=PromoCodeOut)
def create_promo(payload: PromoCodeIn, _: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    code = payload.code.upper().strip()
    if db.query(PromoCode).filter(PromoCode.code == code).first():
        raise HTTPException(400, "Promo code already exists")
    promo = PromoCode(
        code=code,
        description=payload.description,
        discount_type=payload.discount_type,
        value=payload.value,
        min_order=payload.min_order,
        usage_limit=payload.usage_limit,
        is_active=payload.is_active,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
    )
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return promo


@router.put("/promos/{promo_id}", response_model=PromoCodeOut)
def update_promo(
    promo_id: int,
    payload: PromoCodeIn,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    promo = db.get(PromoCode, promo_id)
    if not promo:
        raise HTTPException(404, "Promo not found")
    data = payload.model_dump()
    data["code"] = data["code"].upper().strip()
    for k, v in data.items():
        setattr(promo, k, v)
    db.commit()
    db.refresh(promo)
    return promo


@router.delete("/promos/{promo_id}")
def delete_promo(promo_id: int, _: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    promo = db.get(PromoCode, promo_id)
    if not promo:
        raise HTTPException(404, "Promo not found")
    db.delete(promo)
    db.commit()
    return {"message": "deleted"}


# ---- Offers ----
@router.get("/offers", response_model=list[OfferOut])
def list_offers_admin(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(Offer).order_by(Offer.id.desc()).all()


@router.post("/offers", response_model=OfferOut)
def create_offer(payload: OfferIn, _: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    offer = Offer(**payload.model_dump())
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return offer


@router.put("/offers/{offer_id}", response_model=OfferOut)
def update_offer(
    offer_id: int,
    payload: OfferIn,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    offer = db.get(Offer, offer_id)
    if not offer:
        raise HTTPException(404, "Offer not found")
    for k, v in payload.model_dump().items():
        setattr(offer, k, v)
    db.commit()
    db.refresh(offer)
    return offer


@router.delete("/offers/{offer_id}")
def delete_offer(offer_id: int, _: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    offer = db.get(Offer, offer_id)
    if not offer:
        raise HTTPException(404, "Offer not found")
    db.delete(offer)
    db.commit()
    return {"message": "deleted"}


# ---- Reviews (homepage scroller curation) ----
@router.get("/reviews", response_model=list[ReviewOut])
def admin_list_reviews(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    rows = (
        db.query(Review)
        .options(joinedload(Review.user), joinedload(Review.product))
        .order_by(Review.created_at.desc())
        .all()
    )
    return [serialize_review(r) for r in rows]


@router.patch("/reviews/{review_id}", response_model=ReviewOut)
def admin_toggle_review_home(
    review_id: int,
    payload: ReviewHomeToggle,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    review = (
        db.query(Review)
        .options(joinedload(Review.user), joinedload(Review.product))
        .filter(Review.id == review_id)
        .first()
    )
    if not review:
        raise HTTPException(404, "Review not found")
    review.show_on_home = payload.show_on_home
    db.commit()
    db.refresh(review)
    return serialize_review(review)


@router.delete("/reviews/{review_id}")
def admin_delete_review(review_id: int, _: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(404, "Review not found")
    db.delete(review)
    db.commit()
    return {"message": "deleted"}


# ---- Homepage / site settings ----
@router.get("/settings", response_model=SiteSettingsOut)
def admin_get_settings(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    from app.api.v1.routes.site_settings import get_or_create_settings

    return serialize_settings(get_or_create_settings(db))


@router.put("/settings", response_model=SiteSettingsOut)
def admin_update_settings(
    payload: SiteSettingsIn,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    from app.api.v1.routes.site_settings import get_or_create_settings

    row = get_or_create_settings(db)
    data = payload.model_dump(exclude_unset=True)
    for field in (
        "hero_image_url",
        "about_hero_image_url",
        "about_story_image_url",
        "about_ritual_image_url",
        "quiz_image_url",
    ):
        if field in data:
            setattr(row, field, _clean(data[field]))
    db.commit()
    db.refresh(row)
    return serialize_settings(row)


# ---- Content cards (storefront page sections) ----
@router.get("/content-cards/sections")
def admin_content_card_sections(_: User = Depends(get_admin_user)):
    return {
        "sections": [{"key": k, "label": v} for k, v in PAGE_SECTIONS.items()],
        "layouts": [{"key": k, "label": v} for k, v in CARD_LAYOUTS.items()],
    }


@router.get("/content-cards", response_model=list[ContentCardOut])
def admin_list_content_cards(
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
    page_key: str | None = Query(None),
):
    q = db.query(ContentCard)
    if page_key:
        if page_key not in ALLOWED_PAGE_KEYS:
            raise HTTPException(400, f"Unknown page_key. Allowed: {sorted(ALLOWED_PAGE_KEYS)}")
        q = q.filter(ContentCard.page_key == page_key)
    return q.order_by(ContentCard.page_key.asc(), ContentCard.sort_order.asc(), ContentCard.id.asc()).all()


def _normalize_card_payload(payload: ContentCardIn) -> dict:
    if payload.page_key not in ALLOWED_PAGE_KEYS:
        raise HTTPException(400, f"Unknown page_key. Allowed: {sorted(ALLOWED_PAGE_KEYS)}")
    layout = (payload.layout or "text").strip().lower()
    if layout not in ALLOWED_LAYOUTS:
        raise HTTPException(400, f"Unknown layout. Allowed: {sorted(ALLOWED_LAYOUTS)}")
    image_url = (payload.image_url or "").strip() or None
    if layout != "text" and not image_url:
        raise HTTPException(400, "Upload an image for this layout")
    return {
        "page_key": payload.page_key,
        "title": payload.title.strip(),
        "body": (payload.body or "").strip() or None,
        "image_url": image_url,
        "layout": layout if image_url else "text",
        "sort_order": payload.sort_order,
        "is_active": payload.is_active,
    }


@router.post("/content-cards", response_model=ContentCardOut)
def admin_create_content_card(
    payload: ContentCardIn,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    data = _normalize_card_payload(payload)
    card = ContentCard(**data)
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.put("/content-cards/{card_id}", response_model=ContentCardOut)
def admin_update_content_card(
    card_id: int,
    payload: ContentCardIn,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    card = db.get(ContentCard, card_id)
    if not card:
        raise HTTPException(404, "Card not found")
    data = _normalize_card_payload(payload)
    for key, value in data.items():
        setattr(card, key, value)
    db.commit()
    db.refresh(card)
    return card


@router.delete("/content-cards/{card_id}")
def admin_delete_content_card(
    card_id: int,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    card = db.get(ContentCard, card_id)
    if not card:
        raise HTTPException(404, "Card not found")
    db.delete(card)
    db.commit()
    return {"message": "deleted"}
