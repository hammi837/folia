from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


def utcnow():
    return datetime.now(timezone.utc)


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    email: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(40), default="pending")
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    shipping_name: Mapped[str] = mapped_column(String(120))
    shipping_address: Mapped[str] = mapped_column(Text)
    shipping_city: Mapped[str] = mapped_column(String(80))
    shipping_country: Mapped[str] = mapped_column(String(80))
    shipping_postal: Mapped[str] = mapped_column(String(30))
    stripe_payment_intent_id: Mapped[str | None] = mapped_column(String(120), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"))
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"), nullable=True)
    product_name: Mapped[str] = mapped_column(String(180))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))

    order = relationship("Order", back_populates="items")
    product = relationship("Product")
