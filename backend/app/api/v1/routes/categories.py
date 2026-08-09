from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.category import Category
from app.schemas.product import CategoryOut
from app.services.pricing import absolute_media

router = APIRouter()


@router.get("/", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    rows = db.query(Category).order_by(Category.name.asc()).all()
    return [
        CategoryOut(
            id=c.id,
            name=c.name,
            slug=c.slug,
            description=c.description,
            discount_percent=c.discount_percent,
            image_url=absolute_media(getattr(c, "image_url", None)),
        )
        for c in rows
    ]
