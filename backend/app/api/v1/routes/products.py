from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.product import ProductListOut, ProductDetailOut, ReviewOut
from app.services import product_service

router = APIRouter()


def _review_out(review) -> ReviewOut:
    return ReviewOut(
        id=review.id,
        rating=review.rating,
        title=review.title,
        body=review.body,
        created_at=review.created_at,
        user_name=review.user.full_name if review.user else None,
    )


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
    return product_service.list_products(
        db,
        category=category,
        concern=concern,
        featured=featured,
        q=q,
        min_price=min_price,
        max_price=max_price,
    )


@router.get("/{slug}", response_model=ProductDetailOut)
def product_detail(slug: str, db: Session = Depends(get_db)):
    product = product_service.get_product_by_slug(db, slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    data = ProductDetailOut.model_validate(product)
    data.reviews = [_review_out(r) for r in product.reviews]
    return data
