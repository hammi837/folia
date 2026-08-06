from decimal import Decimal

import stripe

from app.core.config import settings


def stripe_configured() -> bool:
    key = settings.STRIPE_SECRET_KEY or ""
    return bool(key) and not key.startswith("sk_test_xxx") and key.startswith("sk_")


def create_payment_intent(amount: Decimal, email: str, metadata: dict | None = None) -> dict:
    if not stripe_configured():
        return {"id": f"mock_pi_{email}", "client_secret": None, "mock": True}

    stripe.api_key = settings.STRIPE_SECRET_KEY
    cents = int(amount * 100)
    intent = stripe.PaymentIntent.create(
        amount=cents,
        currency="usd",
        receipt_email=email,
        automatic_payment_methods={"enabled": True},
        metadata=metadata or {},
    )
    return {
        "id": intent.id,
        "client_secret": intent.client_secret,
        "mock": False,
    }
