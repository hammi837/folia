# Deploy FOLIA free: Neon + Koyeb + Vercel

Stack:

```text
Browser → Vercel (React)
              ↓
         Koyeb (FastAPI)
              ↓
         Neon (PostgreSQL)
```

---

## 1) Neon (database)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a project (region closest to you)
3. Open **Dashboard → Connection details**
4. Copy the connection string (URI), e.g.

```text
postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
```

Keep this for Koyeb as `DATABASE_URL`.

---

## 2) Koyeb (FastAPI backend)

### A. Create the service

1. Sign up at [koyeb.com](https://www.koyeb.com)
2. **Create App → Deploy from GitHub**
3. Select repo `hammi837/folia`
4. Settings:

| Field | Value |
|--------|--------|
| Builder | **Dockerfile** |
| Dockerfile location | `backend/Dockerfile` |
| Build context / work directory | `backend` (or repo root if Koyeb asks for path to Dockerfile directory) |
| Exposed port | `8000` (or leave default; container listens on `$PORT`) |
| Health check path | `/health` |

If the UI asks for **Root directory**, set it to `backend`.

### B. Environment variables (Koyeb)

Add these (replace values):

```env
APP_NAME=FOLIA
APP_ENV=production
DEBUG=false
SECRET_KEY=generate-a-long-random-string
ACCESS_TOKEN_EXPIRE_MINUTES=10080

DATABASE_URL=postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require

FRONTEND_URL=https://YOUR-VERCEL-APP.vercel.app
PUBLIC_BASE_URL=https://YOUR-KOYEB-APP.koyeb.app

STORE_TIMEZONE=Asia/Karachi

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

Notes:

- Set `PUBLIC_BASE_URL` to the **Koyeb public URL** (no trailing slash).
- After first deploy you will know the exact Koyeb URL — save it, then update `PUBLIC_BASE_URL` and redeploy if needed.
- `FRONTEND_URL` must match your Vercel URL for CORS (update after Vercel deploy if needed).

### C. Deploy & seed

1. Deploy and wait until **Healthy**
2. Open `https://YOUR-KOYEB-APP.koyeb.app/health` → should return `{"status":"ok",...}`
3. Open `https://YOUR-KOYEB-APP.koyeb.app/docs`
4. Seed the database once.

**Option A — from your PC** (easiest):

```bash
cd backend
.\.venv\Scripts\activate
# Temporarily point local .env DATABASE_URL to Neon
python -m app.seed
```

**Option B — Koyeb one-off / console** (if available):

```bash
python -m app.seed
```

Demo logins after seed:

| Role | Email | Password |
|------|--------|----------|
| Admin | admin@folia.beauty | admin123 |
| Demo | demo@folia.beauty | folia123 |

---

## 3) Vercel (React frontend)

1. Sign up at [vercel.com](https://vercel.com)
2. **Add New Project** → import `hammi837/folia`
3. Settings:

| Field | Value |
|--------|--------|
| Framework | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

4. Environment variable:

```env
VITE_API_URL=https://YOUR-KOYEB-APP.koyeb.app/api/v1
```

5. Deploy

6. Copy the Vercel URL (e.g. `https://folia-xxx.vercel.app`)

7. Go back to **Koyeb** → set:

```env
FRONTEND_URL=https://folia-xxx.vercel.app
```

Redeploy the API so CORS allows your storefront.

---

## 4) Smoke test checklist

- [ ] `https://YOUR-KOYEB-APP.koyeb.app/health` OK  
- [ ] `https://YOUR-KOYEB-APP.koyeb.app/docs` loads  
- [ ] Vercel home page loads products  
- [ ] Login as admin → `/admin`  
- [ ] Upload an image (site images / product)  
- [ ] Checkout with promo `FOLIA10` (mock Stripe OK)

---

## Build / start commands (summary)

### Koyeb (Dockerfile already in repo)

- **Dockerfile:** `backend/Dockerfile`
- **Start command (inside image):**  
  `uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}`

### Vercel

- **Root:** `frontend`
- **Build:** `npm run build`
- **Output:** `dist`
- **Env:** `VITE_API_URL=https://<koyeb>/api/v1`

---

## Files added for deploy

| File | Purpose |
|------|---------|
| `backend/Dockerfile` | Container image for Koyeb |
| `backend/.dockerignore` | Smaller / safer builds |
| `frontend/vercel.json` | SPA rewrites for React Router |
| `frontend/src/lib/mediaUrl.js` | Fix `/uploads/...` on separate hosts |
| `PUBLIC_BASE_URL` env | Absolute upload URLs from API |

---

## Free-tier caveats

- Koyeb free apps may **sleep** when idle → first request can be slow  
- Uploaded files live on the container disk → **can disappear on redeploy** (re-upload or later use Cloudinary)  
- Neon free tier has storage / compute limits  
- Keep Stripe in **test** mode for demos  

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS error in browser | `FRONTEND_URL` on Koyeb must equal exact Vercel URL (https, no trailing slash) |
| Images 404 on Vercel | Set `VITE_API_URL` and `PUBLIC_BASE_URL`; hard refresh |
| DB connection failed | Neon URI must include `?sslmode=require` |
| Empty catalogue | Run `python -m app.seed` against Neon |
| Admin 401 | Use seeded admin; token expiry is long (`ACCESS_TOKEN_EXPIRE_MINUTES`) |
