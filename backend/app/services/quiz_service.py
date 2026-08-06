from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.quiz import QuizResult
from app.models.user import User


SKIN_TYPE_MAP = {
    "dry": ["dry", "dehydrated"],
    "oily": ["oily", "combination"],
    "combination": ["combination", "oily"],
    "sensitive": ["sensitive", "dry"],
    "normal": ["normal", "combination"],
}

CONCERN_MAP = {
    "barrier": "barrier",
    "dullness": "dullness",
    "acne": "acne",
    "aging": "aging",
    "hydration": "hydration",
    "redness": "redness",
}


def score_products(db: Session, answers: dict) -> list[Product]:
    skin_type = (answers.get("skin_type") or "normal").lower()
    concern = (answers.get("concern") or "hydration").lower()
    texture = (answers.get("texture") or "serum").lower()
    scent = (answers.get("scent") or "unscented").lower()

    products = db.query(Product).filter(Product.is_active.is_(True)).all()
    scored: list[tuple[int, Product]] = []

    for product in products:
        score = 0
        skin_types = [s.lower() for s in (product.skin_types or [])]
        concerns = [c.lower() for c in (product.concerns or [])]
        name = product.name.lower()
        desc = (product.short_description or "").lower()

        for match in SKIN_TYPE_MAP.get(skin_type, [skin_type]):
            if match in skin_types:
                score += 3
        mapped_concern = CONCERN_MAP.get(concern, concern)
        if mapped_concern in concerns:
            score += 4
        if texture in name or texture in desc:
            score += 2
        if scent == "botanical" and ("oil" in name or "botanical" in desc):
            score += 1
        if scent == "unscented" and "oil" not in name:
            score += 1
        if product.is_featured:
            score += 1
        scored.append((score, product))

    scored.sort(key=lambda x: (-x[0], x[1].name))
    return [p for s, p in scored if s > 0][:4] or [p for _, p in scored[:4]]


def save_quiz_result(
    db: Session,
    answers: dict,
    products: list[Product],
    user: User | None = None,
) -> QuizResult:
    result = QuizResult(
        user_id=user.id if user else None,
        answers=answers,
        recommended_product_ids=[p.id for p in products],
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result
