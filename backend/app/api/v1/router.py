from fastapi import APIRouter

from app.api.v1.routes import (
    auth,
    products,
    categories,
    cart,
    wishlist,
    orders,
    quiz,
    reviews,
    checkout,
    admin,
    promos,
    site_settings,
    content_cards,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(cart.router, prefix="/cart", tags=["Cart"])
api_router.include_router(wishlist.router, prefix="/wishlist", tags=["Wishlist"])
api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])
api_router.include_router(quiz.router, prefix="/quiz", tags=["Quiz"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
api_router.include_router(checkout.router, prefix="/checkout", tags=["Checkout"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(promos.router, prefix="/promos", tags=["Promos"])
api_router.include_router(site_settings.router, prefix="/settings", tags=["Settings"])
api_router.include_router(content_cards.router, prefix="/content-cards", tags=["Content cards"])


@api_router.get("/")
def api_root():
    return {"message": "FOLIA API v1"}
