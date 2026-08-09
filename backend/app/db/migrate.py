"""Ensure additive columns exist on older local databases."""

from sqlalchemy import text

from app.db.session import engine


def ensure_schema_patches() -> None:
    statements = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10,2) DEFAULT 0",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code VARCHAR(40)",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5,2)",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10",
        "ALTER TABLE categories ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5,2)",
        "ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)",
        "ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_hero_image_url VARCHAR(500)",
        "ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_story_image_url VARCHAR(500)",
        "ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_ritual_image_url VARCHAR(500)",
        "ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS quiz_image_url VARCHAR(500)",
        "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_type VARCHAR(20) DEFAULT 'product'",
        "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS guest_name VARCHAR(120)",
        "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS discovery_source VARCHAR(120)",
        "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE",
        "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN DEFAULT FALSE",
        "ALTER TABLE reviews ALTER COLUMN product_id DROP NOT NULL",
        "ALTER TABLE reviews ALTER COLUMN user_id DROP NOT NULL",
        "ALTER TABLE content_cards ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)",
        "ALTER TABLE content_cards ADD COLUMN IF NOT EXISTS layout VARCHAR(30) DEFAULT 'text'",
    ]
    with engine.begin() as conn:
        for stmt in statements:
            try:
                conn.execute(text(stmt))
            except Exception:
                pass

        # Older DBs got show_on_home=FALSE on every row when the column was added.
        # If nothing is curated for home yet, promote existing public reviews.
        try:
            on_home = conn.execute(
                text("SELECT COUNT(*) FROM reviews WHERE show_on_home = TRUE")
            ).scalar()
            if on_home == 0:
                conn.execute(
                    text(
                        "UPDATE reviews SET show_on_home = TRUE "
                        "WHERE COALESCE(is_public, TRUE) = TRUE"
                    )
                )
        except Exception:
            pass
