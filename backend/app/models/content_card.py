from sqlalchemy import String, Integer, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class ContentCard(Base):
    """Editable text/media cards for storefront sections (home brand, about pillars, etc.)."""

    __tablename__ = "content_cards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    page_key: Mapped[str] = mapped_column(String(60), index=True)
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # text | background | image_left | image_right
    layout: Mapped[str] = mapped_column(String(30), default="text")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
