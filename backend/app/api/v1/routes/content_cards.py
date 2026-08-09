from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.content_card import ContentCard
from app.schemas.content_card import ALLOWED_PAGE_KEYS, ContentCardOut

router = APIRouter()


@router.get("/", response_model=list[ContentCardOut])
def list_content_cards(
    db: Session = Depends(get_db),
    page_key: str = Query(..., description="Section key, e.g. home_brand"),
):
    from app.services.pricing import absolute_media

    if page_key not in ALLOWED_PAGE_KEYS:
        raise HTTPException(400, f"Unknown page_key. Allowed: {sorted(ALLOWED_PAGE_KEYS)}")
    rows = (
        db.query(ContentCard)
        .filter(ContentCard.page_key == page_key, ContentCard.is_active.is_(True))
        .order_by(ContentCard.sort_order.asc(), ContentCard.id.asc())
        .all()
    )
    return [
        ContentCardOut(
            id=r.id,
            page_key=r.page_key,
            title=r.title,
            body=r.body,
            image_url=absolute_media(r.image_url),
            layout=getattr(r, "layout", None) or "text",
            sort_order=r.sort_order,
            is_active=r.is_active,
        )
        for r in rows
    ]
