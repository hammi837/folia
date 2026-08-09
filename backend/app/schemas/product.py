from decimal import Decimal
from datetime import datetime

from pydantic import BaseModel, Field


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None = None
    discount_percent: Decimal | None = None
    image_url: str | None = None

    model_config = {"from_attributes": True}


class ProductImageOut(BaseModel):
    id: int
    url: str
    alt: str | None = None
    sort_order: int = 0

    model_config = {"from_attributes": True}


class ProductVariantOut(BaseModel):
    id: int
    name: str
    sku: str
    price_override: Decimal | None = None
    stock: int

    model_config = {"from_attributes": True}


class ReviewOut(BaseModel):
    id: int
    rating: int
    title: str | None = None
    body: str | None = None
    created_at: datetime
    user_name: str | None = None
    review_type: str = "product"
    product_id: int | None = None
    product_name: str | None = None
    discovery_source: str | None = None
    show_on_home: bool = False
    is_public: bool = True

    model_config = {"from_attributes": True}


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    title: str | None = None
    body: str | None = None


class FeedbackCreate(BaseModel):
    """Post-checkout product or brand feedback."""

    review_type: str = Field(pattern="^(product|brand)$")
    rating: int = Field(ge=1, le=5)
    title: str | None = None
    body: str | None = None
    product_id: int | None = None
    guest_name: str | None = None
    discovery_source: str | None = None  # how they found FOLIA (new customers)
    order_id: int | None = None



class ProductListOut(BaseModel):
    id: int
    name: str
    slug: str
    short_description: str | None = None
    price: Decimal
    sale_price: Decimal | None = None
    compare_at_price: Decimal | None = None
    discount_percent: Decimal | None = None
    applied_discount_percent: Decimal | None = None
    discount_source: str | None = None
    is_featured: bool
    is_active: bool | None = True
    stock: int | None = None
    low_stock_threshold: int | None = 10
    is_low_stock: bool | None = False
    concerns: list | None = None
    skin_types: list | None = None
    category: CategoryOut | None = None
    images: list[ProductImageOut] = []

    model_config = {"from_attributes": True}


class ProductDetailOut(ProductListOut):
    description: str | None = None
    ingredients: list | None = None
    results_timeline: list | None = None
    variants: list[ProductVariantOut] = []
    reviews: list[ReviewOut] = []
