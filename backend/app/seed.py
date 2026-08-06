"""Seed FOLIA demo catalog + demo user."""

from decimal import Decimal

from app.core.security import hash_password
from app.db.session import SessionLocal, engine, Base
import app.db.base  # noqa: F401
from app.models.user import User
from app.models.category import Category
from app.models.product import Product, ProductImage, ProductVariant
from app.models.review import Review


CATEGORIES = [
    ("Cleansers", "cleansers", "Gentle first steps that rinse without stripping."),
    ("Serums", "serums", "Targeted actives in calm, light textures."),
    ("Moisturizers", "moisturizers", "Barrier-first creams and gels."),
    ("Oils", "oils", "Botanical finishes for glow and seal."),
]

PRODUCTS = [
    {
        "name": "Cloud Milk Cleanser",
        "slug": "cloud-milk-cleanser",
        "category": "cleansers",
        "short_description": "Silky cleanse for dry and sensitive skin.",
        "description": "A soft milk cleanser that dissolves the day without tugging at the barrier. Rice water and squalane leave skin calm, not squeaky.",
        "price": "28.00",
        "concerns": ["barrier", "dryness", "sensitivity"],
        "skin_types": ["dry", "sensitive", "normal"],
        "ingredients": [
            {"name": "Rice water", "why": "Soothes tightness after cleansing"},
            {"name": "Squalane", "why": "Mimics skin oils without clogging"},
            {"name": "Glycerin", "why": "Pulls light moisture into the surface"},
        ],
        "results_timeline": [
            {"week": "Week 1", "note": "Less tight after washing"},
            {"week": "Week 2", "note": "Makeup removes easier, less redness"},
            {"week": "Week 4", "note": "Barrier feels steadier day to day"},
        ],
        "featured": True,
        "image": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80",
        "variant": {"name": "150 ml", "sku": "FOL-CLN-01"},
    },
    {
        "name": "Moss Gel Wash",
        "slug": "moss-gel-wash",
        "category": "cleansers",
        "short_description": "Fresh gel cleanse for oily and combination skin.",
        "description": "A clarifying gel with willow bark and green tea that clears without the harsh after-feel.",
        "price": "26.00",
        "concerns": ["acne", "oiliness"],
        "skin_types": ["oily", "combination"],
        "ingredients": [
            {"name": "Willow bark", "why": "Gentle clarifying support"},
            {"name": "Green tea", "why": "Calms post-cleanse redness"},
        ],
        "results_timeline": [
            {"week": "Week 1", "note": "Less midday shine"},
            {"week": "Week 3", "note": "Fewer congested patches"},
        ],
        "featured": False,
        "image": "https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=800&q=80",
        "variant": {"name": "120 ml", "sku": "FOL-CLN-02"},
    },
    {
        "name": "Dewdrop Vitamin Serum",
        "slug": "dewdrop-vitamin-serum",
        "category": "serums",
        "short_description": "Brightening serum for dull, tired skin.",
        "description": "A water-light vitamin C derivative serum that wakes up flat tone without sting.",
        "price": "42.00",
        "concerns": ["dullness", "aging"],
        "skin_types": ["normal", "combination", "dry"],
        "ingredients": [
            {"name": "3-O-Ethyl Ascorbic Acid", "why": "Stable brightening support"},
            {"name": "Niacinamide", "why": "Evens look of tone"},
            {"name": "Fermented rice", "why": "Softens texture"},
        ],
        "results_timeline": [
            {"week": "Week 1", "note": "Skin looks more awake"},
            {"week": "Week 4", "note": "Tone looks clearer in daylight"},
            {"week": "Week 8", "note": "Soft glow holds through the day"},
        ],
        "featured": True,
        "image": "https://images.unsplash.com/photo-1620916562916-7f62f4d0b0b8?w=800&q=80",
        "variant": {"name": "30 ml", "sku": "FOL-SER-01"},
    },
    {
        "name": "Quiet Barrier Serum",
        "slug": "quiet-barrier-serum",
        "category": "serums",
        "short_description": "Ceramide serum for compromised barriers.",
        "description": "Ceramides, panthenol, and beta-glucan in a hush of a serum for reactive days.",
        "price": "46.00",
        "concerns": ["barrier", "redness", "sensitivity"],
        "skin_types": ["sensitive", "dry"],
        "ingredients": [
            {"name": "Ceramide NP", "why": "Reinforces barrier lipids"},
            {"name": "Panthenol", "why": "Settles tight, reactive skin"},
            {"name": "Beta-glucan", "why": "Comforts visible redness"},
        ],
        "results_timeline": [
            {"week": "Week 1", "note": "Less reactive to wind and water"},
            {"week": "Week 3", "note": "Redness flares soften"},
        ],
        "featured": True,
        "image": "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800&q=80",
        "variant": {"name": "30 ml", "sku": "FOL-SER-02"},
    },
    {
        "name": "Soft Focus Moisturizer",
        "slug": "soft-focus-moisturizer",
        "category": "moisturizers",
        "short_description": "Daily cream with a blurred, healthy finish.",
        "description": "A mid-weight cream that hydrates without film. Ideal under sunscreen and for combination skin.",
        "price": "38.00",
        "concerns": ["hydration", "dullness"],
        "skin_types": ["normal", "combination"],
        "ingredients": [
            {"name": "Hyaluronic acid", "why": "Surface plumpness"},
            {"name": "Squalane", "why": "Soft seal without grease"},
        ],
        "results_timeline": [
            {"week": "Week 1", "note": "Makeup sits more evenly"},
            {"week": "Week 2", "note": "Afternoon dryness fades"},
        ],
        "featured": True,
        "image": "https://images.unsplash.com/photo-1608248543808-ba9c0f0f3c8c?w=800&q=80",
        "variant": {"name": "50 ml", "sku": "FOL-MOI-01"},
    },
    {
        "name": "Night Orchard Cream",
        "slug": "night-orchard-cream",
        "category": "moisturizers",
        "short_description": "Rich overnight cream for dry skin.",
        "description": "Shea, jojoba, and bakuchiol in a slow-release night cream that wakes skin softer.",
        "price": "48.00",
        "concerns": ["aging", "dryness", "barrier"],
        "skin_types": ["dry", "normal"],
        "ingredients": [
            {"name": "Bakuchiol", "why": "Gentle overnight renewal support"},
            {"name": "Shea butter", "why": "Deep comfort through the night"},
        ],
        "results_timeline": [
            {"week": "Week 2", "note": "Morning bounce returns"},
            {"week": "Week 6", "note": "Fine dryness lines look softer"},
        ],
        "featured": False,
        "image": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80",
        "variant": {"name": "50 ml", "sku": "FOL-MOI-02"},
    },
    {
        "name": "Cedar Glow Oil",
        "slug": "cedar-glow-oil",
        "category": "oils",
        "short_description": "Botanical face oil for evening seal.",
        "description": "A blend of rosehip, squalane, and a whisper of cedarwood for luminous evenings.",
        "price": "44.00",
        "concerns": ["dullness", "aging", "hydration"],
        "skin_types": ["dry", "normal", "combination"],
        "ingredients": [
            {"name": "Rosehip", "why": "Supports even-looking tone"},
            {"name": "Squalane", "why": "Locks moisture without heaviness"},
        ],
        "results_timeline": [
            {"week": "Week 1", "note": "Evening glow looks healthier"},
            {"week": "Week 4", "note": "Texture feels silkier"},
        ],
        "featured": True,
        "image": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
        "variant": {"name": "30 ml", "sku": "FOL-OIL-01"},
    },
    {
        "name": "Horizon SPF Fluid",
        "slug": "horizon-spf-fluid",
        "category": "moisturizers",
        "short_description": "Sheer daily SPF that disappears into skin.",
        "description": "A weightless SPF 30 fluid designed for clean-beauty routines that hate white cast.",
        "price": "36.00",
        "concerns": ["aging", "barrier"],
        "skin_types": ["normal", "oily", "combination", "dry"],
        "ingredients": [
            {"name": "Zinc oxide (non-nano)", "why": "Broad mineral protection"},
            {"name": "Bisabolol", "why": "Keeps SPF days comfortable"},
        ],
        "results_timeline": [
            {"week": "Week 1", "note": "No pilling under makeup"},
            {"week": "Week 4", "note": "Tone looks more even outdoors"},
        ],
        "featured": False,
        "image": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
        "variant": {"name": "40 ml", "sku": "FOL-MOI-03"},
    },
    {
        "name": "Petal Mist Essence",
        "slug": "petal-mist-essence",
        "category": "serums",
        "short_description": "Hydrating mist-essence for midday calm.",
        "description": "A fine mist with glycerin and fermented botanicals for desks, flights, and dry rooms.",
        "price": "32.00",
        "concerns": ["hydration", "redness"],
        "skin_types": ["dry", "sensitive", "normal", "combination"],
        "ingredients": [
            {"name": "Glycerin", "why": "Quick comfort in dry air"},
            {"name": "Centella", "why": "Settles flushed moments"},
        ],
        "results_timeline": [
            {"week": "Week 1", "note": "Skin feels less tight midday"},
        ],
        "featured": False,
        "image": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
        "variant": {"name": "100 ml", "sku": "FOL-SER-03"},
    },
    {
        "name": "Ink Spot Overnight Serum",
        "slug": "ink-spot-overnight-serum",
        "category": "serums",
        "short_description": "Overnight clarity for congested skin.",
        "description": "A quiet overnight serum with azelaic acid and niacinamide for texture and spots.",
        "price": "40.00",
        "concerns": ["acne", "dullness"],
        "skin_types": ["oily", "combination", "normal"],
        "ingredients": [
            {"name": "Azelaic acid", "why": "Supports clearer-looking texture"},
            {"name": "Niacinamide", "why": "Balances look of oil and tone"},
        ],
        "results_timeline": [
            {"week": "Week 2", "note": "Congestion looks softer"},
            {"week": "Week 6", "note": "Spot marks fade gradually"},
        ],
        "featured": False,
        "image": "https://images.unsplash.com/photo-1629198688000-71f23e745b69?w=800&q=80",
        "variant": {"name": "30 ml", "sku": "FOL-SER-04"},
    },
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Product).count() > 0:
            print("Catalog already seeded — skipping.")
            return

        cats = {}
        for name, slug, desc in CATEGORIES:
            cat = Category(name=name, slug=slug, description=desc)
            db.add(cat)
            db.flush()
            cats[slug] = cat

        demo = User(
            email="demo@folia.beauty",
            hashed_password=hash_password("folia123"),
            full_name="FOLIA Demo",
        )
        db.add(demo)
        db.flush()

        created_products = []
        for item in PRODUCTS:
            product = Product(
                name=item["name"],
                slug=item["slug"],
                short_description=item["short_description"],
                description=item["description"],
                price=Decimal(item["price"]),
                category_id=cats[item["category"]].id,
                concerns=item["concerns"],
                ingredients=item["ingredients"],
                results_timeline=item["results_timeline"],
                skin_types=item["skin_types"],
                is_featured=item["featured"],
                stock=80,
            )
            db.add(product)
            db.flush()
            db.add(
                ProductImage(
                    product_id=product.id,
                    url=item["image"],
                    alt=item["name"],
                    sort_order=0,
                )
            )
            db.add(
                ProductImage(
                    product_id=product.id,
                    url="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80",
                    alt=f"{item['name']} lifestyle",
                    sort_order=1,
                )
            )
            v = item["variant"]
            db.add(
                ProductVariant(
                    product_id=product.id,
                    name=v["name"],
                    sku=v["sku"],
                    stock=80,
                )
            )
            created_products.append(product)

        reviews = [
            (0, 5, "My new morning cleanse", "Doesn't strip. Skin feels soft after."),
            (2, 5, "Glow without grit", "Brightening without the usual sting."),
            (3, 5, "Finally calmed my barrier", "Redness days are quieter."),
            (4, 4, "Perfect under SPF", "Light enough for humid weather."),
            (6, 5, "Evening ritual staple", "Two drops seal everything."),
        ]
        for idx, rating, title, body in reviews:
            db.add(
                Review(
                    product_id=created_products[idx].id,
                    user_id=demo.id,
                    rating=rating,
                    title=title,
                    body=body,
                )
            )

        db.commit()
        print("Seeded categories, 10 products, demo user demo@folia.beauty / folia123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
