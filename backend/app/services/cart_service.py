from sqlalchemy.orm import Session, joinedload

from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User


def get_or_create_user_cart(db: Session, user: User) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user.id).order_by(Cart.id.desc()).first()
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


def serialize_cart(cart: Cart) -> dict:
    items = []
    subtotal = 0.0
    for item in cart.items:
        product: Product = item.product
        unit = float(item.variant.price_override) if item.variant and item.variant.price_override is not None else float(product.price)
        line = unit * item.quantity
        subtotal += line
        items.append(
            {
                "id": item.id,
                "product_id": item.product_id,
                "variant_id": item.variant_id,
                "quantity": item.quantity,
                "product_name": product.name,
                "unit_price": unit,
                "image": product.images[0].url if product.images else None,
            }
        )
    return {"id": cart.id, "items": items, "subtotal": round(subtotal, 2)}


def load_cart(db: Session, cart_id: int) -> Cart | None:
    return (
        db.query(Cart)
        .options(
            joinedload(Cart.items).joinedload(CartItem.product).joinedload(Product.images),
            joinedload(Cart.items).joinedload(CartItem.variant),
        )
        .filter(Cart.id == cart_id)
        .first()
    )
