from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class SiteSettings(Base):
    """Single-row storefront settings (id is always 1). Images set via admin upload."""

    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    hero_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    about_hero_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    about_story_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    about_ritual_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    quiz_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
