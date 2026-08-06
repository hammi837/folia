from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.cart import CartItem
from app.models.user import User
from app.schemas.cart import CartItemIn, CartOut
from app.services import cart_service, product_service

router = APIRouter()


@router.get("/", response_model=CartOut)
def get_cart(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = cart_service.get_or_create_user_cart(db, user)
    loaded = cart_service.load_cart(db, cart.id)
    return cart_service.serialize_cart(loaded)


@router.post("/items", response_model=CartOut)
def add_item(
    payload: CartItemIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = product_service.get_product(db, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    cart = cart_service.get_or_create_user_cart(db, user)
    existing = (
        db.query(CartItem)
        .filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == payload.product_id,
            CartItem.variant_id == payload.variant_id,
        )
        .first()
    )
    if existing:
        existing.quantity += payload.quantity
    else:
        db.add(
            CartItem(
                cart_id=cart.id,
                product_id=payload.product_id,
                variant_id=payload.variant_id,
                quantity=payload.quantity,
            )
        )
    db.commit()
    loaded = cart_service.load_cart(db, cart.id)
    return cart_service.serialize_cart(loaded)


@router.patch("/items/{item_id}", response_model=CartOut)
def update_item(
    item_id: int,
    quantity: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = cart_service.get_or_create_user_cart(db, user)
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    if quantity <= 0:
        db.delete(item)
    else:
        item.quantity = quantity
    db.commit()
    loaded = cart_service.load_cart(db, cart.id)
    return cart_service.serialize_cart(loaded)


@router.delete("/items/{item_id}", response_model=CartOut)
def remove_item(
    item_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = cart_service.get_or_create_user_cart(db, user)
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    loaded = cart_service.load_cart(db, cart.id)
    return cart_service.serialize_cart(loaded)
