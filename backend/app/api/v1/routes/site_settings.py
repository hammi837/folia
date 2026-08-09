from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.site_settings import SiteSettings
from app.schemas.site_settings import SiteSettingsOut, serialize_settings

router = APIRouter()


def get_or_create_settings(db: Session) -> SiteSettings:
    row = db.get(SiteSettings, 1)
    if not row:
        row = SiteSettings(id=1)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


@router.get("/", response_model=SiteSettingsOut)
def public_site_settings(db: Session = Depends(get_db)):
    return serialize_settings(get_or_create_settings(db))
