# FOLIA

**Clean beauty ecommerce** — editorial storefront, skin quiz, checkout, and a full admin CMS.

Built with **FastAPI**, **React (Vite)**, **PostgreSQL**, and **Stripe** (test / mock).

Repository: [github.com/hammi837/folia](https://github.com/hammi837/folia)

---

## Highlights

- Editorial home page with CMS-driven brand cards, honesty tiles, offers, and reviews
- Shop filters by collection and skin concern
- Skin quiz with scored product recommendations
- Cart, wishlist, JWT auth, checkout with promo codes
- Admin panel for catalogue, orders, revenue, promos, offers, site images, reviews, and page cards
- Image layouts for page cards (text only, full background, image left / right)

---

## Tech stack

| Layer | Technology |
|--------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Redux Toolkit + Persist, Axios, React Router |
| Backend | FastAPI, SQLAlchemy 2, Pydantic Settings, Alembic, JWT (python-jose), Passlib |
| Database | PostgreSQL |
| Payments | Stripe test mode (auto mock-paid when keys are placeholders) |
| Timezone | Store day boundaries via `STORE_TIMEZONE` (default `Asia/Karachi`) |

---

## Quick start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### 1. Database

Create a local database named `folia`, then configure env:

```bash
cd backend
copy .env.example .env   # Windows
# cp .env.example .env   # macOS / Linux
```

Set in `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=folia
DB_USER=postgres
DB_PASSWORD=your_password
STORE_TIMEZONE=Asia/Karachi
```

Optional: `docker compose up -d db`, then match those credentials in `.env`.

### 2. Backend

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\activate

# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload --port 8000
```

| Resource | URL |
|----------|-----|
| API | http://localhost:8000 |
| OpenAPI docs | http://localhost:8000/docs |
| Health | http://localhost:8000/health |

### 3. Frontend

```bash
cd frontend
copy .env.example .env   # Windows
npm install
npm run dev
```

| Resource | URL |
|----------|-----|
| Storefront | http://localhost:5173 |
| Admin | http://localhost:5173/admin |

Point `VITE_API_URL` at the API if needed (default: `http://localhost:8000/api/v1`).

---

## Demo accounts

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@folia.beauty` | `admin123` |
| Customer | `demo@folia.beauty` | `folia123` |

Promo at checkout: **`FOLIA10`** (10% off, min order applies).

---

## Storefront features

- **Home** — hero (CMS image), featured products, category carousel, editorial offers, brand / honesty cards, quiz CTA, homepage reviews
- **Shop** — search, collection, and skin-concern filters
- **Product detail** — gallery, variants, ingredients, results timeline, reviews
- **Skin quiz** — guided consultation → personal product edit
- **About** — story, pillars, ritual (CMS text/image cards + images)
- **Cart & wishlist** — Redux-persisted local state
- **Checkout** — Stripe test or mock paid; promo codes; order confirmation
- **Order complete** — product or brand first-impression review prompt
- **Account / orders** — JWT session, order history

---

## Admin CMS (`/admin`)

| Section | What you can do |
|---------|------------------|
| **Dashboard** | Catalogue counts, revenue (today / week / month / year + custom date range) |
| **Site images** | Home hero, About hero / story / ritual, quiz panel |
| **Page cards** | Add / edit / reorder / hide cards per section; layouts: text, background, image left, image right |
| **Products** | CRUD, stock, featured, discounts, image upload |
| **Categories** | CRUD, image, optional category discount |
| **Orders** | Status updates; filter by from / to date (store timezone) |
| **Promo codes** | Percent or fixed, min order, usage limits |
| **Offers** | Category / product % discounts + homepage campaign banners |
| **Reviews** | Toggle “Show on homepage”, delete |

Page card sections include:

- Home — Brand promises  
- Home — Ingredient honesty tiles  
- About — What we stand for  
- About — Ritual steps  

---

## Stripe

Leave placeholder keys for **mock checkout** (orders marked `paid` without Stripe):

```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

Replace with real Stripe **test** keys to create PaymentIntents.

---

## Project structure

```text
folia/
├── backend/
│   ├── app/
│   │   ├── api/v1/routes/     # auth, products, cart, checkout, admin, CMS…
│   │   ├── models/            # catalog, orders, reviews, promos, content cards…
│   │   ├── schemas/
│   │   ├── services/          # pricing, promos, content cards, orders
│   │   ├── db/                # session, migrate patches
│   │   ├── seed.py
│   │   └── main.py
│   ├── uploads/products/      # admin image uploads
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/             # storefront + admin
│   │   ├── components/
│   │   ├── store/             # Redux Toolkit + persist
│   │   └── services/api.js
│   └── package.json
├── docs/                      # architecture & gig notes
├── docker-compose.yml
└── README.md
```

---

## Scripts reference

| Task | Command |
|------|---------|
| Seed DB | `cd backend && python -m app.seed` |
| API (dev) | `uvicorn app.main:app --reload --port 8000` |
| Frontend (dev) | `cd frontend && npm run dev` |
| Frontend build | `cd frontend && npm run build` |

---

## Docs

- [Deploy free (Neon + Railway + Vercel)](docs/DEPLOY.md)
- [Gig / demo checklist](docs/GIG.md)
- [Structure notes](docs/STRUCTURE.md)

---

## License

Private portfolio / demo project. All rights reserved unless otherwise noted.
