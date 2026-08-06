# FOLIA — Folder & Architecture Map

## Monorepo

```
H:\folia
├── backend/                 FastAPI + SQLAlchemy + Alembic
├── frontend/                React (Vite) + Tailwind
├── docs/                    Docs & diagrams
├── docker-compose.yml       PostgreSQL
├── .gitignore
└── README.md
```

## Backend tree

```
backend/
├── alembic/
│   └── versions/            Migration scripts
├── app/
│   ├── main.py
│   ├── api/v1/
│   │   ├── router.py
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── products.py
│   │       ├── categories.py
│   │       ├── cart.py
│   │       ├── wishlist.py
│   │       ├── orders.py
│   │       ├── quiz.py
│   │       ├── reviews.py
│   │       └── checkout.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── deps.py
│   ├── db/
│   │   ├── base.py
│   │   └── session.py
│   ├── models/
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── category.py
│   │   ├── cart.py
│   │   ├── order.py
│   │   ├── wishlist.py
│   │   ├── review.py
│   │   └── quiz.py
│   ├── schemas/
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── cart.py
│   │   ├── order.py
│   │   └── common.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── product_service.py
│   │   ├── cart_service.py
│   │   ├── order_service.py
│   │   ├── quiz_service.py
│   │   └── stripe_service.py
│   └── utils/
│       └── helpers.py
├── tests/
├── requirements.txt
└── .env.example
```

## Frontend tree

```
frontend/src/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── home/
│   ├── product/
│   └── cart/
├── pages/
├── hooks/
├── services/
│   └── api.js
├── store/
├── context/
├── styles/
└── utils/
```

## PostgreSQL tables (planned)

- users
- categories
- products
- product_images
- product_variants
- carts / cart_items
- wishlists
- orders / order_items
- reviews
- quiz_results
