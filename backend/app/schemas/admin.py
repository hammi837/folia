from decimal import Decimal

from pydantic import BaseModel, Field


class ReviewHomeToggle(BaseModel):
    show_on_home: bool


class CategoryIn(BaseModel):
    name: str
    slug: str
    description: str | None = None
    discount_percent: Decimal | None = None
    image_url: str | None = None


class ProductAdminIn(BaseModel):
    name: str
    slug: str
    short_description: str | None = None
    description: str | None = None
    price: Decimal
    compare_at_price: Decimal | None = None
    discount_percent: Decimal | None = None
    category_id: int | None = None
    concerns: list[str] = []
    ingredients: list = []
    results_timeline: list = []
    skin_types: list[str] = []
    is_featured: bool = False
    is_active: bool = True
    stock: int = 50
    low_stock_threshold: int = 10
    image_urls: list[str] = []
    variant_name: str | None = "Standard"
    variant_sku: str | None = None


class OrderStatusIn(BaseModel):
    status: str = Field(pattern="^(pending|paid|shipped|delivered|cancelled)$")


class LowStockAlert(BaseModel):
    id: int
    name: str
    slug: str
    stock: int
    low_stock_threshold: int


class RevenuePeriodOut(BaseModel):
    today: float = 0
    week: float = 0
    month: float = 0
    year: float = 0
    all_time: float = 0
    custom: float | None = None
    custom_from: str | None = None
    custom_to: str | None = None
    custom_orders: int | None = None


class DashboardOut(BaseModel):
    products: int
    categories: int
    orders: int
    users: int
    revenue: float
    revenue_breakdown: RevenuePeriodOut | None = None
    active_promos: int
    active_offers: int
    low_stock_count: int = 0
    low_stock_alerts: list[LowStockAlert] = []
