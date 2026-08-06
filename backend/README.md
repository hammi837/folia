# FOLIA Backend — FastAPI

## Layout

```
backend/
├── alembic/                 # DB migrations
│   └── versions/
├── app/
│   ├── main.py              # FastAPI entry
│   ├── api/
│   │   └── v1/
│   │       ├── router.py    # Aggregate all routes
│   │       └── routes/      # auth, products, cart, orders...
│   ├── core/                # config, security, dependencies
│   ├── db/                  # session, base
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic request/response
│   ├── services/            # Business logic
│   └── utils/               # helpers
├── tests/
├── requirements.txt
├── .env.example
└── alembic.ini
```

## API modules (planned)

| Route prefix | File | Purpose |
|---|---|---|
| `/api/v1/auth` | `routes/auth.py` | Register, login, me |
| `/api/v1/products` | `routes/products.py` | CRUD, list, filters |
| `/api/v1/categories` | `routes/categories.py` | Categories |
| `/api/v1/cart` | `routes/cart.py` | Cart items |
| `/api/v1/wishlist` | `routes/wishlist.py` | Wishlist |
| `/api/v1/orders` | `routes/orders.py` | Place & list orders |
| `/api/v1/quiz` | `routes/quiz.py` | Skin quiz |
| `/api/v1/reviews` | `routes/reviews.py` | Product reviews |
| `/api/v1/checkout` | `routes/checkout.py` | Stripe payment intent |
