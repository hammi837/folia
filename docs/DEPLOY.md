# Deploy FOLIA free: Neon + Railway + Vercel

```text
Browser → Vercel (React)
              ↓
         Railway (FastAPI)
              ↓
         Neon (PostgreSQL)
```

---

## 1) Neon (database)

1. [neon.tech](https://neon.tech) → create project  
2. **Connect** → copy **URI**  
3. Prefer this form (drop `channel_binding` if Python fails to connect):

```text
postgresql://USER:PASSWORD@ep-XXXX.REGION.aws.neon.tech/neondb?sslmode=require
```

---

## 2) Railway (FastAPI backend)

1. Go to [railway.app](https://railway.app) → login with GitHub  
2. **New Project** → **Deploy from GitHub repo** → select `hammi837/folia`  
3. Railway will detect the root **`Dockerfile`** (already in the repo)

### Variables (Railway → your service → Variables)

```env
APP_NAME=FOLIA
APP_ENV=production
DEBUG=false
SECRET_KEY=generate-a-long-random-string
ACCESS_TOKEN_EXPIRE_MINUTES=10080

DATABASE_URL=postgresql://USER:PASSWORD@ep-XXXX.REGION.aws.neon.tech/neondb?sslmode=require

FRONTEND_URL=https://YOUR-APP.vercel.app
PUBLIC_BASE_URL=https://YOUR-RAILWAY-URL.up.railway.app

STORE_TIMEZONE=Asia/Karachi

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### Generate a public URL

1. Service → **Settings** → **Networking** → **Generate Domain**  
2. Copy that URL (e.g. `https://folia-production-xxxx.up.railway.app`)  
3. Set `PUBLIC_BASE_URL` to that URL (no trailing slash)  
4. Redeploy if you added it after the first deploy  

### Health check

Open:

```text
https://YOUR-RAILWAY-URL.up.railway.app/health
```

Should return `{"status":"ok","app":"FOLIA"}`.

Docs: `https://YOUR-RAILWAY-URL.up.railway.app/docs`

### Seed the database (once)

On your PC:

```bash
cd backend
.\.venv\Scripts\activate
```

Put the **same Neon** `DATABASE_URL` in `backend/.env`, then:

```bash
python -m app.seed
```

| Role | Email | Password |
|------|--------|----------|
| Admin | admin@folia.beauty | admin123 |
| Demo | demo@folia.beauty | folia123 |

---

## 3) Vercel (React frontend)

1. [vercel.com](https://vercel.com) → **Add New Project** → import `hammi837/folia`  
2. Settings:

| Field | Value |
|--------|--------|
| Root Directory | `frontend` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

3. Environment variable:

```env
VITE_API_URL=https://YOUR-RAILWAY-URL.up.railway.app/api/v1
```

4. Deploy → copy the Vercel URL  

5. Back on **Railway**, set:

```env
FRONTEND_URL=https://YOUR-VERCEL-APP.vercel.app
```

Redeploy Railway so CORS allows the storefront.

---

## Build / start (already in repo)

| Host | What it uses |
|------|----------------|
| **Railway** | Root `Dockerfile` → `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Vercel** | `frontend` → `npm run build` → `dist` |

---

## If Railway build fails

1. Confirm latest `main` includes `Dockerfile` (commit: *Add Docker and deploy config…*)  
2. Service **Settings** → Builder = **Dockerfile**  
3. Dockerfile path = `/Dockerfile` (repo root)  
4. Do **not** set root directory to `frontend`  

Optional: if you prefer building only from `backend/`:

- Root Directory = `backend`  
- Dockerfile path = `Dockerfile` (the one inside `backend/`)

---

## Smoke test

- [ ] Railway `/health` OK  
- [ ] Railway `/docs` loads  
- [ ] Vercel home loads products  
- [ ] Login admin → `/admin`  
- [ ] Upload image works  
- [ ] Checkout + promo `FOLIA10`  

---

## Free-tier notes

- Railway free/trial credits run out — watch the usage bar  
- Neon free DB is fine for demos  
- Uploaded images on Railway disk can reset on redeploy — re-upload or use Cloudinary later  
- Keep Stripe in **test** mode  

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS errors | `FRONTEND_URL` on Railway = exact Vercel URL |
| Images 404 | Set `VITE_API_URL` + `PUBLIC_BASE_URL` |
| DB connect fail | Neon URI with `?sslmode=require` only |
| Empty shop | Run `python -m app.seed` against Neon |
| Build failed | Redeploy after `Dockerfile` is on `main` |
