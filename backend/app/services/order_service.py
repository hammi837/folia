from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import CheckoutIn


def create_order_from_checkout(
    db: Session,
    payload: CheckoutIn,
    user: User | None,
    payment_intent_id: str | None,
    status: str = "paid",
) -> Order:
    total = Decimal("0.00")
    line_items: list[tuple[Product, int, Decimal]] = []

    for item in payload.items:
        product = db.get(Product, item.product_id)
        if not product or not product.is_active:
            raise ValueError(f"Product {item.product_id} unavailable")
        unit = Decimal(product.price)
        if item.variant_id:
            variant = next((v for v in product.variants if v.id == item.variant_id), None)
            if variant and variant.price_override is not None:
                unit = Decimal(variant.price_override)
        total += unit * item.quantity
        line_items.append((product, item.quantity, unit))

    order = Order(
        user_id=user.id if user else None,
        email=payload.email.lower(),
        status=status,
        total=total,
        shipping_name=payload.shipping_name,
        shipping_address=payload.shipping_address,
        shipping_city=payload.shipping_city,
        shipping_country=payload.shipping_country,
        shipping_postal=payload.shipping_postal,
        stripe_payment_intent_id=payment_intent_id,
    )
    db.add(order)
    db.flush()

    for product, qty, unit in line_items:
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                quantity=qty,
                unit_price=unit,
            )
        )
        product.stock = max(0, product.stock - qty)

    db.commit()
    db.refresh(order)
    return order
