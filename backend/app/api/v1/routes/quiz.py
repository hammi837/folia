from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_optional_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.product import ProductListOut
from app.services import quiz_service

router = APIRouter()


class QuizIn(BaseModel):
    skin_type: str
    concern: str
    texture: str = "serum"
    scent: str = "unscented"


class QuizOut(BaseModel):
    answers: dict
    recommendations: list[ProductListOut]
    quiz_result_id: int


@router.post("/recommend", response_model=QuizOut)
def recommend(
    payload: QuizIn,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    answers = payload.model_dump()
    products = quiz_service.score_products(db, answers)
    result = quiz_service.save_quiz_result(db, answers, products, user)
    return QuizOut(
        answers=answers,
        recommendations=products,
        quiz_result_id=result.id,
    )
