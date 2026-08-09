from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.promo import PromoCode


def _aware(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def get_promo_by_code(db: Session, code: str) -> PromoCode | None:
    return db.query(PromoCode).filter(PromoCode.code == code.upper().strip()).first()


def validate_promo(db: Session, code: str, subtotal: Decimal) -> tuple[PromoCode | None, Decimal, str]:
    promo = get_promo_by_code(db, code)
    if not promo or not promo.is_active:
        return None, Decimal("0"), "Invalid promo code"
    now = datetime.now(timezone.utc)
    starts = _aware(promo.starts_at)
    ends = _aware(promo.ends_at)
    if starts and now < starts:
        return None, Decimal("0"), "Promo not active yet"
    if ends and now > ends:
        return None, Decimal("0"), "Promo expired"
    if promo.usage_limit is not None and promo.used_count >= promo.usage_limit:
        return None, Decimal("0"), "Promo usage limit reached"
    if subtotal < Decimal(promo.min_order or 0):
        return None, Decimal("0"), f"Minimum order ${promo.min_order}"

    if promo.discount_type == "fixed":
        amount = min(Decimal(promo.value), subtotal)
    else:
        amount = (subtotal * Decimal(promo.value) / Decimal("100")).quantize(Decimal("0.01"))
    return promo, amount, "Applied"


def increment_promo_usage(db: Session, promo: PromoCode) -> None:
    promo.used_count += 1
    db.add(promo)
