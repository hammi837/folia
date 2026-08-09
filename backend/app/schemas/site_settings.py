from pydantic import BaseModel


class SiteSettingsOut(BaseModel):
    hero_image_url: str | None = None
    about_hero_image_url: str | None = None
    about_story_image_url: str | None = None
    about_ritual_image_url: str | None = None
    quiz_image_url: str | None = None

    model_config = {"from_attributes": True}


class SiteSettingsIn(BaseModel):
    hero_image_url: str | None = None
    about_hero_image_url: str | None = None
    about_story_image_url: str | None = None
    about_ritual_image_url: str | None = None
    quiz_image_url: str | None = None


def _clean(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def serialize_settings(row) -> SiteSettingsOut:
    from app.services.pricing import absolute_media

    return SiteSettingsOut(
        hero_image_url=absolute_media(_clean(getattr(row, "hero_image_url", None))),
        about_hero_image_url=absolute_media(_clean(getattr(row, "about_hero_image_url", None))),
        about_story_image_url=absolute_media(_clean(getattr(row, "about_story_image_url", None))),
        about_ritual_image_url=absolute_media(_clean(getattr(row, "about_ritual_image_url", None))),
        quiz_image_url=absolute_media(_clean(getattr(row, "quiz_image_url", None))),
    )
