from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.review import Review
from app.models.user import User
from app.schemas.product import ReviewCreate, ReviewOut
from app.services import product_service

router = APIRouter()


@router.post("/{product_id}", response_model=ReviewOut)
def create_review(
    product_id: int,
    payload: ReviewCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    review = Review(
        product_id=product_id,
        user_id=user.id,
        rating=payload.rating,
        title=payload.title,
        body=payload.body,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return ReviewOut(
        id=review.id,
        rating=review.rating,
        title=review.title,
        body=review.body,
        created_at=review.created_at,
        user_name=user.full_name,
    )
