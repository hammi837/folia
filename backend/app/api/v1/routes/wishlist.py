from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.product import Product
from app.models.user import User
from app.models.wishlist import Wishlist
from app.schemas.product import ProductListOut
from app.services import product_service

router = APIRouter()


@router.get("/", response_model=list[ProductListOut])
def list_wishlist(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(Wishlist)
        .options(
            joinedload(Wishlist.product).joinedload(Product.images),
            joinedload(Wishlist.product).joinedload(Product.category),
        )
        .filter(Wishlist.user_id == user.id)
        .all()
    )
    return [row.product for row in rows if row.product]


@router.post("/{product_id}", response_model=dict)
def add_wishlist(product_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    existing = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user.id, Wishlist.product_id == product_id)
        .first()
    )
    if not existing:
        db.add(Wishlist(user_id=user.id, product_id=product_id))
        db.commit()
    return {"message": "added", "product_id": product_id}


@router.delete("/{product_id}", response_model=dict)
def remove_wishlist(product_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user.id, Wishlist.product_id == product_id)
        .first()
    )
    if row:
        db.delete(row)
        db.commit()
    return {"message": "removed", "product_id": product_id}
