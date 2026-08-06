from decimal import Decimal
from datetime import datetime

from pydantic import BaseModel, Field


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None = None

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

    model_config = {"from_attributes": True}


class ProductListOut(BaseModel):
    id: int
    name: str
    slug: str
    short_description: str | None = None
    price: Decimal
    compare_at_price: Decimal | None = None
    is_featured: bool
    concerns: list | None = None
    skin_types: list | None = None
    category: CategoryOut | None = None
    images: list[ProductImageOut] = []

    model_config = {"from_attributes": True}


class ProductDetailOut(ProductListOut):
    description: str | None = None
    ingredients: list | None = None
    results_timeline: list | None = None
    stock: int
    variants: list[ProductVariantOut] = []
    reviews: list[ReviewOut] = []


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    title: str | None = None
    body: str | None = None
