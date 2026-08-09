from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user, get_optional_user
from app.db.session import get_db
from app.models.review import Review
from app.models.user import User
from app.schemas.product import FeedbackCreate, ReviewCreate, ReviewOut
from app.services import product_service

router = APIRouter()


def _serialize(review: Review) -> ReviewOut:
    name = None
    if review.user and review.user.full_name:
        name = review.user.full_name
    elif review.guest_name:
        name = review.guest_name
    return ReviewOut(
        id=review.id,
        rating=review.rating,
        title=review.title,
        body=review.body,
        created_at=review.created_at,
        user_name=name,
        review_type=getattr(review, "review_type", None) or "product",
        product_id=review.product_id,
        product_name=review.product.name if review.product else None,
        discovery_source=getattr(review, "discovery_source", None),
        show_on_home=bool(getattr(review, "show_on_home", False)),
        is_public=bool(getattr(review, "is_public", True) if getattr(review, "is_public", None) is not None else True),
    )


@router.get("/", response_model=list[ReviewOut])
def list_reviews(
    db: Session = Depends(get_db),
    limit: int = Query(24, ge=1, le=50),
    review_type: str | None = None,
):
    """Homepage scroller — only reviews the admin selected for home."""
    q = (
        db.query(Review)
        .options(joinedload(Review.user), joinedload(Review.product))
        .filter(Review.show_on_home.is_(True))
        .filter(or_(Review.is_public.is_(True), Review.is_public.is_(None)))
        .order_by(Review.created_at.desc())
    )
    if review_type in {"product", "brand"}:
        if review_type == "product":
            q = q.filter(or_(Review.review_type == "product", Review.review_type.is_(None)))
        else:
            q = q.filter(Review.review_type == review_type)
    return [_serialize(r) for r in q.limit(limit).all()]


@router.post("/feedback", response_model=ReviewOut)
def submit_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    if payload.review_type == "product":
        if not payload.product_id:
            raise HTTPException(400, "Select a product to review")
        product = product_service.get_product(db, payload.product_id)
        if not product:
            raise HTTPException(404, "Product not found")
    else:
        payload.product_id = None

    if not user and not (payload.guest_name and payload.guest_name.strip()):
        raise HTTPException(400, "Please add your name")

    review = Review(
        product_id=payload.product_id,
        user_id=user.id if user else None,
        review_type=payload.review_type,
        rating=payload.rating,
        title=payload.title,
        body=payload.body,
        guest_name=None if user else payload.guest_name.strip(),
        discovery_source=payload.discovery_source,
        is_public=True,
        show_on_home=False,  # admin must select for homepage scroller
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    review = (
        db.query(Review)
        .options(joinedload(Review.user), joinedload(Review.product))
        .filter(Review.id == review.id)
        .first()
    )
    return _serialize(review)


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
        review_type="product",
        rating=payload.rating,
        title=payload.title,
        body=payload.body,
        is_public=True,
        show_on_home=False,
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
        review_type="product",
        product_id=product_id,
        product_name=product.name,
        show_on_home=False,
        is_public=True,
    )
