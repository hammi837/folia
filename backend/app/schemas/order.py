from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field


class CheckoutItemIn(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)
    variant_id: int | None = None


class CheckoutIn(BaseModel):
    email: EmailStr
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_country: str
    shipping_postal: str
    items: list[CheckoutItemIn]
    promo_code: str | None = None


class OrderItemOut(BaseModel):
    id: int
    product_id: int | None
    product_name: str
    quantity: int
    unit_price: Decimal

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    email: str
    status: str
    total: Decimal
    subtotal: Decimal | None = None
    discount_amount: Decimal | None = None
    promo_code: str | None = None
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_country: str
    shipping_postal: str
    stripe_payment_intent_id: str | None = None
    created_at: datetime
    items: list[OrderItemOut] = []

    model_config = {"from_attributes": True}


class CheckoutOut(BaseModel):
    order: OrderOut
    client_secret: str | None = None
    mock_paid: bool = False
    publishable_key: str | None = None
