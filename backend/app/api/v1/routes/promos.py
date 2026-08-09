from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.promo import Offer
from app.schemas.promo import OfferOut, PromoValidateIn, PromoValidateOut
from app.services import promo_service

router = APIRouter()


def _is_active_window(obj) -> bool:
    now = datetime.now(timezone.utc)
    starts = obj.starts_at
    ends = obj.ends_at
    if starts and starts.tzinfo is None:
        starts = starts.replace(tzinfo=timezone.utc)
    if ends and ends.tzinfo is None:
        ends = ends.replace(tzinfo=timezone.utc)
    if starts and now < starts:
        return False
    if ends and now > ends:
        return False
    return True


@router.get("/offers", response_model=list[OfferOut])
def public_offers(db: Session = Depends(get_db)):
    from app.services.pricing import absolute_media

    offers = db.query(Offer).filter(Offer.is_active.is_(True)).order_by(Offer.id.desc()).all()
    out = []
    for o in offers:
        if not _is_active_window(o):
            continue
        out.append(
            OfferOut(
                id=o.id,
                title=o.title,
                badge_text=o.badge_text,
                description=o.description,
                discount_percent=o.discount_percent,
                image_url=absolute_media(o.image_url),
                category_id=o.category_id,
                product_id=o.product_id,
                is_active=o.is_active,
                starts_at=o.starts_at,
                ends_at=o.ends_at,
                created_at=o.created_at,
            )
        )
    return out


@router.post("/validate", response_model=PromoValidateOut)
def validate_promo(payload: PromoValidateIn, db: Session = Depends(get_db)):
    promo, amount, message = promo_service.validate_promo(db, payload.code, Decimal(payload.subtotal))
    if not promo:
        return PromoValidateOut(valid=False, message=message, discount_amount=Decimal("0"))
    return PromoValidateOut(
        valid=True,
        code=promo.code,
        discount_type=promo.discount_type,
        value=promo.value,
        discount_amount=amount,
        message=message,
    )
