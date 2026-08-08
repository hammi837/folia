from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models.product import Product
from app.models.category import Category
from app.models.review import Review


def list_products(
    db: Session,
    *,
    category: str | None = None,
    concern: str | None = None,
    featured: bool | None = None,
    q: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
):
    query = (
        db.query(Product)
        .options(joinedload(Product.images), joinedload(Product.category))
        .filter(Product.is_active.is_(True))
    )
    if category:
        query = query.join(Category).filter(Category.slug == category)
    if featured is not None:
        query = query.filter(Product.is_featured.is_(featured))
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(Product.name.ilike(like), Product.short_description.ilike(like))
        )
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    products = query.order_by(Product.is_featured.desc(), Product.name.asc()).all()
    if concern:
        products = [p for p in products if concern.lower() in [c.lower() for c in (p.concerns or [])]]
    return products


def get_product_by_slug(db: Session, slug: str) -> Product | None:
    return (
        db.query(Product)
        .options(
            joinedload(Product.images),
            joinedload(Product.variants),
            joinedload(Product.category),
            joinedload(Product.reviews).joinedload(Review.user),
        )
        .filter(Product.slug == slug, Product.is_active.is_(True))
        .first()
    )


def get_product(db: Session, product_id: int) -> Product | None:
    return db.get(Product, product_id)
