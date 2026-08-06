from pydantic import BaseModel, Field


class CartItemIn(BaseModel):
    product_id: int
    variant_id: int | None = None
    quantity: int = Field(ge=1, default=1)


class CartItemOut(BaseModel):
    id: int
    product_id: int
    variant_id: int | None = None
    quantity: int
    product_name: str | None = None
    unit_price: float | None = None
    image: str | None = None

    model_config = {"from_attributes": True}


class CartOut(BaseModel):
    id: int
    items: list[CartItemOut] = []
    subtotal: float = 0
