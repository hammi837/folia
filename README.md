# FOLIA — Clean Beauty Ecommerce

Full-stack clean beauty storefront for a Fiverr portfolio demo.
**FastAPI + React (Vite) + PostgreSQL + Stripe (test / mock).**

Live repo: https://github.com/hammi837/folia

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind, Framer Motion, Zustand, Axios |
| Backend | FastAPI, SQLAlchemy 2, Pydantic Settings, Alembic, JWT |
| Database | PostgreSQL |
| Payments | Stripe test mode (auto mock-paid if keys are placeholders) |

## Quick start

### 1. Database

Create a local database named `folia`, then copy env:

```bash
cd backend
copy .env.example .env
```

Set in `backend/.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=folia
DB_USER=postgres
DB_PASSWORD=your_password
```

(Optional Docker Postgres: `docker compose up -d db` — then match those credentials in `.env`.)

### 2. Backend

```bash
cd backend
python -m venv .venv
# Windows
.\.venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  

**Demo user:** `demo@folia.beauty` / `folia123`

### 3. Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

- Storefront: http://localhost:5173  

## Features

- Home hero, bestsellers, ingredient story, quiz CTA
- Shop with category / concern / search filters
- Product detail: gallery, variants, ingredients, results timeline, reviews
- Local cart drawer + cart page
- Skin quiz → scored product recommendations
- Auth (register / login / JWT)
- Wishlist (local)
- Checkout (Stripe test or mock paid) + orders history
- Seeded catalogue (~10 products)

## Stripe

Leave `STRIPE_SECRET_KEY=sk_test_xxx` for mock checkout (orders marked `paid`).  
Replace with real Stripe test keys to create PaymentIntents.

## Fiverr gig checklist

See [docs/GIG.md](docs/GIG.md) for screenshot shots and loom script.

## Project structure

```
folia/
├── backend/          # FastAPI API
├── frontend/         # React storefront
├── docs/             # Architecture + gig notes
├── docker-compose.yml
└── README.md
```
