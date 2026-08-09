"""Default storefront content cards seeded when a section is empty."""

from app.models.content_card import ContentCard

DEFAULT_CARDS = {
    "home_brand": [
        ("Fewer formulas", "A short shelf — cleanse, treat, seal — so every bottle earns its place."),
        ("Barrier first", "Comfort before intensity. We build for skin that needs calm as much as clarity."),
        ("Honest lists", "Every active has a why. No foggy complexes, no filler claims."),
        ("Quiet packaging", "Soft finishes, clear labels, materials chosen with care."),
        ("Quiz-led guidance", "Not sure where to start? Four calm questions, a personal edit."),
        ("30-day calm guarantee", "If a formula isn’t right, we’ll help you exchange or return with ease."),
    ],
    "home_honesty": [
        ("No fragrance drama", "Unscented options that still feel sensorial."),
        ("Barrier first", "Ceramides, panthenol, and calm textures."),
        ("Short lists", "Fewer actives, clearer results timelines."),
        ("Quiz-led", "Recommendations matched to skin, not trends."),
    ],
    "about_pillars": [
        ("Honest ingredients", "Every formula lists what it does and why it’s there — no foggy complexes, no filler claims."),
        ("Barrier-first care", "Comfort first, actives second. Rituals that restore instead of strip."),
        ("Quiet packaging", "Recyclable materials, soft finishes, and labels you can actually read."),
    ],
    "about_ritual": [
        ("Cleanse", "Rinse the day. Keep the barrier."),
        ("Treat", "One serum. One concern. Done."),
        ("Seal", "Cream or oil to lock the calm in."),
    ],
}


def ensure_default_content_cards(db) -> int:
    """Insert default cards for any empty page section. Returns number of rows added."""
    added = 0
    for page_key, items in DEFAULT_CARDS.items():
        existing = db.query(ContentCard).filter(ContentCard.page_key == page_key).count()
        if existing:
            continue
        for i, (title, body) in enumerate(items):
            db.add(
                ContentCard(
                    page_key=page_key,
                    title=title,
                    body=body,
                    sort_order=i,
                    is_active=True,
                )
            )
            added += 1
    if added:
        db.commit()
    return added
