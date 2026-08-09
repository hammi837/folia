from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class PromoCodeIn(BaseModel):
    code: str = Field(min_length=2, max_length=40)
    description: str | None = None
    discount_type: str = "percent"  # percent | fixed
    value: Decimal
    min_order: Decimal = Decimal("0")
    usage_limit: int | None = None
    is_active: bool = True
    starts_at: datetime | None = None
    ends_at: datetime | None = None


class PromoCodeOut(PromoCodeIn):
    id: int
    used_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class OfferIn(BaseModel):
    title: str
    badge_text: str | None = None
    description: str | None = None
    discount_percent: Decimal | None = None
    image_url: str | None = None
    category_id: int | None = None
    product_id: int | None = None
    is_active: bool = True
    starts_at: datetime | None = None
    ends_at: datetime | None = None


class OfferOut(OfferIn):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class PromoValidateIn(BaseModel):
    code: str
    subtotal: Decimal


class PromoValidateOut(BaseModel):
    valid: bool
    code: str | None = None
    discount_type: str | None = None
    value: Decimal | None = None
    discount_amount: Decimal = Decimal("0")
    message: str | None = None
