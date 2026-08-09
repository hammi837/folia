from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.product import ProductListOut, ProductDetailOut
from app.services import product_service, pricing

router = APIRouter()


@router.get("/", response_model=list[ProductListOut])
def list_products(
    category: str | None = None,
    concern: str | None = None,
    featured: bool | None = None,
    q: str | None = None,
    min_price: float | None = Query(default=None),
    max_price: float | None = Query(default=None),
    db: Session = Depends(get_db),
):
    products = product_service.list_products(
        db,
        category=category,
        concern=concern,
        featured=featured,
        q=q,
        min_price=min_price,
        max_price=max_price,
    )
    offers = pricing.get_active_offers(db)
    return [pricing.serialize_product(p, offers) for p in products]


@router.get("/{slug}", response_model=ProductDetailOut)
def product_detail(slug: str, db: Session = Depends(get_db)):
    product = product_service.get_product_by_slug(db, slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    offers = pricing.get_active_offers(db)
    return pricing.serialize_product(product, offers, detail=True)
