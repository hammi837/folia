from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.core.deps import get_optional_user
from app.db.session import get_db
from app.models.order import Order
from app.models.user import User
from app.schemas.order import CheckoutIn, CheckoutOut, OrderOut
from app.services import order_service, stripe_service

router = APIRouter()


@router.post("/", response_model=CheckoutOut)
def checkout(
    payload: CheckoutIn,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    try:
        # Build a temporary order total first via service path
        order = order_service.create_order_from_checkout(
            db,
            payload,
            user,
            payment_intent_id=None,
            status="pending",
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    payment = stripe_service.create_payment_intent(order.total, payload.email, {"order_id": str(order.id)})
    order.stripe_payment_intent_id = payment["id"]
    if payment.get("mock"):
        order.status = "paid"
    db.commit()
    db.refresh(order)

    loaded = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order.id)
        .first()
    )

    return CheckoutOut(
        order=OrderOut.model_validate(loaded),
        client_secret=payment.get("client_secret"),
        mock_paid=bool(payment.get("mock")),
        publishable_key=settings.STRIPE_PUBLISHABLE_KEY or None,
    )
