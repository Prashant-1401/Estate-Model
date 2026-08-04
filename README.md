# Estate Model — Real Estate CRM

A full-stack real estate CRM. The frontend is a Next.js (App Router) single-page dashboard; the backend is a FastAPI service backed by PostgreSQL.

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, TypeScript, Framer Motion
- **Backend**: FastAPI, SQLAlchemy (async), Alembic, PostgreSQL
- **Deploy**: Render (backend + PostgreSQL/Neon), Vercel (frontend)

## Architecture

The frontend and backend are separate services. The browser only ever talks to the Next.js origin:

```
Browser ──► Next.js (pages + /api proxy) ──► FastAPI (/api/*) ──► PostgreSQL
```

- The Next.js catch-all route `src/app/api/[...path]/route.ts` proxies `/api/*` requests to the backend.
- Auth uses a JWT stored in an httpOnly `estatecrm_token` cookie (set by `/api/auth/login`, read by the proxy, cleared by `/api/auth/logout`). The token never touches `localStorage`.
- Backend list endpoints return paginated envelopes: `{ items, total, page, per_page, pages }`, and accept `page`, `per_page`, `search`, and (where applicable) `status` query parameters.

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL / DATABASE_URL_SYNC / CORS_ORIGINS / JWT_SECRET
```

Apply database migrations and start the API:

```bash
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

The API docs are available at http://localhost:8000/docs.

### Frontend

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment Variables

### Frontend (`.env.local`)

| Variable | Description | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Public base URL of the backend API (used when `BACKEND_API_URL` is unset) | — |
| `BACKEND_API_URL` | Server-only backend URL used by the `/api` proxy. Takes precedence over `NEXT_PUBLIC_API_URL`. | — |

If neither is set, the proxy falls back to `http://localhost:8000`.

### Backend (`backend/.env`)

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Async (`asyncpg`) PostgreSQL URL, e.g. `postgresql+asyncpg://...` |
| `DATABASE_URL_SYNC` | Sync (`psycopg2`) URL for Alembic. Optional — if empty, it is derived from `DATABASE_URL`. |
| `CORS_ORIGINS` | Comma-separated allowed origins (e.g. `http://localhost:3000`) |
| `JWT_SECRET` | Secret used to sign JWTs. Change in production. |

## Database Migrations

Migrations live in `backend/alembic/versions/`. The backend runs `alembic upgrade head` automatically on startup, so deployments stay in sync.

```bash
cd backend
alembic revision --autogenerate -m "description"   # create a new migration
alembic upgrade head                                # apply pending migrations
alembic downgrade -1                                # roll back one step
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build (runs TypeScript checks) |
| `npm run lint` | Run ESLint |
| `npm start` | Start the production Next.js server |
| `alembic upgrade head` | Apply backend migrations |
| `uvicorn app.main:app` | Start the FastAPI server |

## API Overview

All routes below `/api/*` are proxied through Next.js and can also be hit directly against the backend. Authenticated endpoints require a valid session.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/login` | Log in, returns user + sets cookie |
| GET | `/api/auth/me` | Current authenticated user |
| POST | `/api/auth/logout` | Clears the session cookie |
| GET | `/api/dashboard/stats` | Dashboard stats (incl. `revenue_mtd`) |
| GET/POST | `/api/leads`, `/api/properties`, `/api/projects`, `/api/users` | List (paginated) / create |
| GET/PUT/DELETE | `/api/{resource}/{id}` | Read / update / delete a record |
| POST | `/api/public/leads` | Public lead capture (no auth) — used by the `/add-lead` form; forces `source=Website`, `status=New`, `assigned=Unassigned` |

The authenticated `POST /api/leads` requires a valid session (used inside the CRM). The public marketing form (`/add-lead`) submits to `POST /api/public/leads`, which needs no authentication.

## Deployment

- **Backend (Render)**: set the `DATABASE_URL` / `DATABASE_URL_SYNC` / `JWT_SECRET` environment variables and push to the repo — the `Procfile` runs `alembic upgrade head && uvicorn app.main:app`.
- **Frontend (Vercel)**: set `BACKEND_API_URL` (or `NEXT_PUBLIC_API_URL`) to the public backend URL. The cookie is httpOnly and `secure`, so a HTTPS origin is required in production.
