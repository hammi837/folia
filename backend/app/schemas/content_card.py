from pydantic import BaseModel, Field


PAGE_SECTIONS = {
    "home_brand": "Home — Brand promises",
    "home_honesty": "Home — Ingredient honesty tiles",
    "about_pillars": "About — What we stand for",
    "about_ritual": "About — Ritual steps",
}

ALLOWED_PAGE_KEYS = set(PAGE_SECTIONS.keys())

CARD_LAYOUTS = {
    "text": "Text only",
    "background": "Full background image + text overlay",
    "image_left": "Image left · text right",
    "image_right": "Text left · image right",
}

ALLOWED_LAYOUTS = set(CARD_LAYOUTS.keys())


class ContentCardIn(BaseModel):
    page_key: str = Field(min_length=2, max_length=60)
    title: str = Field(min_length=1, max_length=200)
    body: str | None = None
    image_url: str | None = None
    layout: str = "text"
    sort_order: int = 0
    is_active: bool = True


class ContentCardOut(BaseModel):
    id: int
    page_key: str
    title: str
    body: str | None = None
    image_url: str | None = None
    layout: str = "text"
    sort_order: int = 0
    is_active: bool = True

    model_config = {"from_attributes": True}
