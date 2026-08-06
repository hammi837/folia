# FOLIA — Clean Beauty Ecommerce

Full-stack ecommerce store built with **FastAPI + React + PostgreSQL**.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React (Vite), Tailwind CSS, Framer Motion / GSAP |
| Backend | FastAPI, SQLAlchemy / SQLModel, Pydantic, Alembic |
| Database | PostgreSQL |
| Auth | JWT |
| Payments | Stripe (test mode) |

## Project structure

```
folia/
├── backend/          # FastAPI API
├── frontend/         # React (Vite) storefront
├── docs/             # Architecture notes
├── docker-compose.yml
└── README.md
```

## Quick start

### 1. Database
```bash
docker compose up -d db
```

### 2. Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

- API docs: http://localhost:8000/docs  
- Storefront: http://localhost:5173  

## Features (planned)

- Auth (register / login / JWT)
- Products, categories, variants, search & filters
- Cart, wishlist, checkout
- Orders & order history
- Skin quiz → product recommendations
- Reviews
- Admin-ready API structure
