# EstateModel — Real Estate CRM: Complete Working & Logic Flow Guide

A full-stack real estate CRM. This guide documents the complete working of the system and the logic flow of every page — frontend (Next.js SPA) and backend (FastAPI).

---

## 1. Overview & Architecture

```
Browser ──► Next.js (pages + /api proxy) ──► FastAPI (/api/*) ──► PostgreSQL
```

- **Frontend** (`src/`): Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, lucide-react, React Compiler enabled (`next.config.ts` → `reactCompiler: true`).
- **Backend** (`backend/app/`): FastAPI, async SQLAlchemy 2.0, Alembic, PostgreSQL (Neon/Render). Zero foreign keys — all cross-table links are plain string columns.
- The browser **only ever talks to the Next.js origin**. All `/api/*` calls hit the catch-all proxy, which forwards them to FastAPI and injects the auth token from an httpOnly cookie. See `README.md` and §2.

The whole dashboard is a **single-page app**: `src/app/page.tsx` renders one shell (`DashboardContent`) and switches between ~17 in-page "views" via an `activeView` state (`src/app/page.tsx:45`). The only real routes are `/login`, `/add-lead`, and the `/api/*` route handlers.

### Key entry points

| File | Purpose |
| --- | --- |
| `src/app/layout.tsx` | Root layout — wraps children in `AuthProvider` → `ToastProvider` (line 25) |
| `src/app/page.tsx` | The main SPA dashboard (`DashboardContent`) + auth guard (`DashboardPage`) |
| `src/app/login/page.tsx` | Public login screen |
| `src/app/add-lead/page.tsx` | Public "Find Your Dream Property" lead-capture form |
| `src/app/api/[...path]/route.ts` | Catch-all proxy to the backend |
| `src/app/api/auth/{login,me,logout}/route.ts` | Session cookie management |
| `backend/app/main.py` | FastAPI app — routers mounted, startup migrations + seed |

---

## 2. Request & Data Flow (end-to-end)

### 2.1 Client fetch wrapper — `src/lib/api.ts`

- `API_BASE = ""` (line 1) → all requests are relative (`/api/...`), so they hit the Next.js origin.
- Every request gets a 20-second `AbortController` timeout (line 3, 27–29).
- `handleResponse` (lines 5–24): on non-2xx it unwraps the FastAPI `detail` (string or `[{msg}]` array) into a thrown `Error`. 204 → `undefined`.
- Helpers: `api.get / post / put / delete` (lines 43–61). POST/PUT send `Content-Type: application/json`.

### 2.2 Backend URL resolution — `src/lib/backend-url.ts`

```
BACKEND_URL = BACKEND_API_URL || NEXT_PUBLIC_API_URL || "http://localhost:8000"
TOKEN_COOKIE = "estatecrm_token";  TOKEN_MAX_AGE_SECONDS = 86400
```

`BACKEND_API_URL` is server-only (for the proxy); `NEXT_PUBLIC_API_URL` is public. The cookie is httpOnly, so the browser JS never reads it.

### 2.3 The proxy — `src/app/api/[...path]/route.ts`

Flow for every `fetch("/api/leads?page=1")`:

1. Next.js route handler `proxy()` (line 9) reads the path array from params, joins as `/api/<path>` (line 15) and appends the original query string (lines 16–17).
2. Reads `estatecrm_token` from the cookie store (lines 11–12).
3. If a token exists, sets `Authorization: Bearer <token>` (line 20); copies `Content-Type` (lines 21–22).
4. Forwards method/body with `cache: "no-store"` (lines 24–27). Network failure → `502 { detail: "Network error..." }` (line 33).
5. Passes the backend response through: JSON passthrough (line 46), empty body → 204-style null (line 39), otherwise text with original content-type (lines 48–51).

### 2.4 Backend request handling

Every authenticated endpoint:

1. FastAPI dependency `require_role(...)` (`backend/app/auth.py:60–68`) → calls `get_current_user` (line 40) which decodes the JWT, loads the `User` row, then checks `user.role in allowed_roles` → 403 otherwise.
2. The router runs a SQLAlchemy query against the async session (`get_db`, `backend/app/database.py:36`).
3. List endpoints return the paginated envelope `{ items, total, page, per_page, pages }` (via `paginate()` and `Page` schema — `backend/app/pagination.py:16`, `backend/app/schemas/common.py:8`).

### 2.5 Pagination + search convention

- Query params: `page` (≥1), `per_page` (1–100, max clamped), optional `search`, optional `status`.
- `search` → `ilike "%<term>%"` over specific columns per resource (e.g. leads: name/phone/id; users: name/email/phone/role).
- Ordered `created_at DESC` on business tables; `name`/`sort_order` on config tables.
- Frontend `usePaginatedData<T>(endpoint, opts)` (`src/lib/use-paginated-data.ts`) centralizes this: debounced search (300 ms, lines 28–34), auto-jump to last page when the current page empties (lines 49–51), exposes `items/total/pages/page/perPage/search/status/loading/error/reload`.

---

## 3. Auth Logic Flow

### 3.1 Login

```
/login (page.tsx)  →  useAuth().login(email, password)         [src/lib/auth-context.tsx:56]
                     →  POST /api/auth/login                    [src/app/api/auth/login/route.ts:12]
                         →  POST {BACKEND_URL}/api/auth/login    [backend/app/routers/user.py:28]
                             →  find user by email, verify_password (bcrypt)
                             →  create_access_token({sub: user.id})   [auth.py:26]
                             →  return {access_token, user}
                     →  set httpOnly cookie estatecrm_token = access_token  (sameSite lax, secure in prod, maxAge 86400) [login/route.ts:50]
                     →  setUser(...) in context, router.push("/")
```

- Password hashing: bcrypt (`hash_password`/`verify_password`, `backend/app/auth.py:18–23`).
- JWT: HS256, `exp` = now + 1440 min (24 h) (`backend/app/config.py:22`, `auth.py:26–30`). Only claim is `sub` = user id.
- There is **no backend logout endpoint** — logout is purely a cookie delete (`src/app/api/auth/logout/route.ts:8`).

### 3.2 Session restore on app boot

`AuthProvider` (`src/lib/auth-context.tsx:37`) on mount:
1. `localStorage.removeItem("estatecrm_token")` — cleanup of an old pattern; the token never lives in localStorage today (line 42).
2. `GET /api/auth/me` → `src/app/api/auth/me/route.ts:6` short-circuits with `401 { detail: "Not authenticated" }` when no cookie (line 10), otherwise forwards with Bearer to the backend (`user.py:52`).
3. On success, stores `{ ...user, initials }`; renders `null` until `isLoaded` so the app never flashes unauthenticated UI (lines 78–80).

### 3.3 Authorization in the UI

- `hasRole("admin", "manager")` → `roles.includes(user.role)` (`auth-context.tsx:73–76`).
- `canManage = hasRole("admin", "manager")` gates edit/delete affordances in `page.tsx:239` (Leads/Properties/Projects).
- The Users view is admin-only (`page.tsx:274`).
- Sidebar items are filtered per role in `src/components/Layout.tsx:48–50`.

### 3.4 Authorization on the backend

- `require_role(*roles)` is the **only** enforcement (`auth.py:60–68`). It matches the hard-coded role strings `admin` / `manager` / `agent` (`backend/app/constants.py`).
- The database-backed permissions system (modules → permissions → role_permissions) is fully CRUD-able and rendered in admin UIs, but is **not consulted by any route guard** today (see §8 and §10).

### Public vs protected endpoints

Public (no token): `POST /api/auth/login`, `POST /api/public/leads`, `GET /api/company`, `GET /api/forms/{id}/render`, `GET /api/config/statuses/all`, `GET /api/config/lead-sources/all`, `GET /api/dropdowns/all`, `GET /api/dropdowns/list`, `GET /api/dashboard-config/widgets/all`, `GET /` (FastAPI root). Everything else requires a Bearer token.

---

## 4. Public Pages

### 4.1 `/login` — `src/app/login/page.tsx`

- Local state: email, password, showPassword, error, isLoading (lines 10–14).
- `handleSubmit` (line 18): calls `login()` from `useAuth()`; on success `router.push("/")`, else shows "Invalid email or password" (line 27).
- Shows the seeded admin credentials box (lines 106–112): `admin@estatecrm.com / admin123`.

### 4.2 `/add-lead` — `src/app/add-lead/page.tsx`

Public lead-capture form ("Find Your Dream Property"):
- Fields: name*, phone*, email, budget, area, property type, message.
- `validate()`: name required; phone must be ≥7 digits after stripping `[\s\-+]`.
- `handleSubmit`: `POST /api/public/leads` — a public endpoint (`backend/app/routers/public.py`) that needs no session. It accepts `name/phone/email/budget/area/type/requirement` and forces `source: "Website"`, `status: "New"`, `assigned: "Unassigned"`, plus a server-side display date. On success shows a thank-you screen.

---

## 5. Main Dashboard (`/`) — the SPA Shell

`src/app/page.tsx` → `DashboardPage` (line 843) guards: redirects to `/login` when `!isAuthenticated`, else renders `DashboardContent`.

### 5.1 State & data (lines 42–100)

- `activeView` (line 45) drives every view; default `"dashboard"`.
- 12+ modal flags: add lead/property/project/user, edit lead/property/project, `selectedProperty`, `deleteConfirm`, admin-module open flags (lines 47–66).
- Four `usePaginatedData` instances (lines 68–71):
  - `leads` (`/api/leads`), `properties` (`/api/properties`, perPage 9), `projects` (`/api/projects`, perPage 10), `users` (`/api/users`).
- `followUps` loaded via `GET /api/follow-ups?per_page=100` (`loadFollowUps`, lines 74–81).
- `stats` via `GET /api/dashboard/stats` (`reloadStats`, lines 83–91).
- Boot: `Promise.all([reloadStats(), loadFollowUps()])` then `setLoading(false)` (lines 93–100).

### 5.2 Shared CRUD handlers

| Handler | Line | Action | Re-loads |
| --- | --- | --- | --- |
| `handleAddLead` | 102 | `POST /api/leads` (defaults: source Direct, status New, assigned Unassigned) | leads + stats |
| `handleAddProperty` | 125 | `POST /api/properties` | properties + stats |
| `handleAddProject` | 135 | `POST /api/projects` | projects + stats |
| `handleAddUser` | 145 | `POST /api/users` | users + stats |
| `handleEditLead` | 161 | `PUT /api/leads/{id}` | leads |
| `handleEditProperty` | 182 | `PUT /api/properties/{id}` | properties + stats |
| `handleEditProject` | 192 | `PUT /api/projects/{id}` | projects |
| `handleDelete` | 202 | `DELETE /api/{type}/{id}` (lead/property/project) | corresponding + stats |
| `handleUpdateUserRole` | 218 | `PUT /api/users/{id}` `{role}` | users |
| `handleToggleUserStatus` | 228 | `PUT /api/users/{id}` `{status}` | users |

All handlers show a toast on success and surface the thrown error via toast on failure.

### 5.3 The view switch (`renderView`, lines 241–689)

| activeView | Renders | Guard |
| --- | --- | --- |
| `dashboard` | `ConfigurableDashboard` (onAddLead → opens AddLead modal) | all |
| `leads` | `LeadsTable` (edit/delete gated by `canManage`; row → customer profile) | all |
| `customers` | `CustomerProfile` (with selected lead or empty) | all |
| `users` | `UsersTable` | **admin only** |
| `properties` | Property card grid + `Pagination` (`[9,18,36]`) | all |
| `projects` | Inline projects table + `Pagination` | all |
| `follow-ups` | `KanbanBoard` | all |
| `settings` / `help` | Static placeholder panels | all |
| `components` | `ComponentBuilder` (sub-tabs: Forms, Statuses, Lead Sources, Dropdowns, Notifications, Workflows, Roles & Permissions, Company) | admin |
| (default) | `ConfigurableDashboard` | all |

### 5.4 Modals & shell (lines 704–838)

Content is wrapped in `DashboardLayout` (line 704). All modals are rendered after the main content: `AddLeadCard`, `AddPropertyCard`, `AddProjectCard`, `AddUserCard`, `EditLeadCard`, `EditPropertyCard`, `EditProjectCard`, `PropertyDetailCard` (selected property), admin modals (`RoleEditModal`, `PermissionsMatrix`, `FormBuilder`, `StatusManager`, `LeadSourceManager`, `NotificationManager`, `WorkflowBuilder`, `CompanySettings`), and a delete-confirm dialog (line 773). Each admin component is opened by setting its open flag and closed via `onClose`.

### 5.5 Layout & navigation — `src/components/Layout.tsx`

- `sidebarItems` (lines 23–40) with `hasRole` filtering (lines 48–50).
- Sticky header with search, notification bell, user menu + initials avatar; logout POSTs `/api/auth/logout` then routes to `/login` (lines 52–55).
- Mobile slide-in sidebar (lines 60–127); content area re-animates per `activeView` via a `key` (lines 199–207); floating "+" FAB triggers `onFabClick` (lines 211–218).

---

## 6. Per-View Logic Flow

### 6.1 Dashboard — `src/components/dashboard/ConfigurableDashboard.tsx`

- Fetches 4 endpoints in parallel via `Promise.allSettled` (lines 157–162): `/api/dashboard-config/widgets/all`, `/api/dashboard-config/my-dashboard`, `/api/leads?per_page=10`, `/api/follow-ups?per_page=10`.
- Stat cards: renders active `stat` widgets from `/api/dashboard-config/widgets/all`, falling back to `DEFAULT_STAT_WIDGETS` (lines 178–204); values from the `STAT_VALUES` map incl. `revenue_mtd` (lines 187–195).
- `tableEnabled` / `listEnabled` toggles (lines 205–206) control the Recent Leads table and Upcoming Follow-ups list.
- Revenue banner (lines 240–254); static quick stats (Conversion 12.5%, Avg Response 2.4 hrs, Active Agents = `stats.total_users`, lines 303–351).
- `onAddLead` prop opens the Add Lead modal (`page.tsx:244`).

Backend for stats — `backend/app/routers/dashboard.py` `GET /api/dashboard/stats` (lines 20–68): counts leads (total/today/hot), properties (total/available/sold), projects, users; `revenue_mtd` = sum of parsed INR prices of properties `status == "Sold"` with `updated_at >= month start` (lines 47–56), formatted via `money.py` (`parse_inr_price`/`format_inr`).

### 6.2 Leads — `LeadsTable` + add/edit modals + customer

- **`LeadsTable.tsx`**: desktop table + mobile cards (lines 22+); status color mapping (lines 9–14); WhatsApp (`wa.me`) / Call (`tel:`) links on desktop action cells and mobile card buttons; status dropdown; `Pagination`; props `onEdit?`/`onDelete?`/`onViewCustomer?` (lines 18–36). Row/action clicks call `onViewCustomer(lead)` which sets `selectedCustomer` and switches to the `customers` view (`page.tsx:264`).
- **`AddLeadCard.tsx`**: validation (name ≥2 chars, phone `^\d{7,}$`, budget required, lines 31–54); builds `Record<string, string>` and calls `onSubmit(formData)`; resets after submit.
- **`EditLeadCard.tsx`**: prefilled from `lead`, calls `onSubmit(lead.id, formData)`.
- Backend (`backend/app/routers/lead.py`): list (search on name/phone/id, `status` filter — line 16), get, create (requires any role — line 50), update/delete (admin/manager — lines 64/82).

### 6.3 Customers — `src/components/CustomerProfile.tsx`

- Empty state when no lead selected (lines 16–22); else initials avatar, contact details.
- WhatsApp/Call/Share buttons: `wa.me/<digits>` and `tel:` native links; Share uses `navigator.share()` with clipboard + toast fallback (lines 32–49).
- Pipeline tracker (Initial Contact → Site Visit → Negotiation → Closed) and status chip; static activity timeline + recommended-properties placeholders (lines 30+).
- Back to Leads via `onBack` (`page.tsx:269`). Note: no separate API — operates on the lead object passed from the leads view.

### 6.4 Properties — cards, detail, add/edit

- **`PropertyCard.tsx`**: image carousel + dots, status/featured badges, hover edit/delete (stopPropagation, lines 130–175); click → `onViewDetails(id)`.
- **`PropertyDetailCard.tsx`**: gallery + thumbnails, like/share, WhatsApp/Call buttons, stat tiles, status chip (statusColors Available/Reserved/Sold), property id.
- **`AddPropertyCard.tsx`**: validates title/price/positive ints (lines 33–53); FileReader converts images to base64 `photos` (lines 55–85); builds a `Property` with a client-generated `id` (lines 70–81).
- **`EditPropertyCard.tsx`**: loads `/api/projects?per_page=100` on open (lines 25–32); **Linked Project** dropdown (assign/unlink `project_id`, saved via PUT) + **View Project** button (`onViewProject` → `page.tsx` closes the modal and switches to the `projects` view, lines 763–765); merges edits + `project_id` into the PUT payload (lines 55–66).
- Backend (`backend/app/routers/property.py`): CRUD; search on title/location; create/update/delete admin+manager; list/get admin+manager+agent. `Property.project_id` is a nullable string (model line 21); accepted by `PropertyUpdate` schema.

### 6.5 Projects — table, add/edit

- `page.tsx` renders an inline table (name/developer/location/status badge/units/sold/price range/completion + edit/delete actions, lines 433–485).
- **`AddProjectCard.tsx`**: validates name/developer/priceRange (lines 33–40), defaults status "Planning", builds `Project` with client id (lines 56–62).
- **`EditProjectCard.tsx`**: spreads project, re-parses ints (lines 32–44), PUT on save.
- Backend (`backend/app/routers/project.py`): CRUD mirroring properties; search on name/developer/location.

### 6.6 Follow-ups (Kanban) — `src/components/KanbanBoard.tsx`

- Columns: Today / Tomorrow / This Week / Decision Pending (lines 10–15).
- Status change → `PUT /api/follow-ups/{id}` (lines 31–39); delete → `DELETE /api/follow-ups/{id}`.
- Per-card quick-move buttons (lines 153–164); `FollowUpModal` create/edit via `POST`/`PUT /api/follow-ups` with validation `lead_id` + `lead_name` (lines 204–369).
- Backend (`backend/app/routers/follow_up.py`): CRUD for all three roles (agents can also edit/delete here); `per_page` default 50; `status` filter only.

### 6.7 Users — `UsersTable` + `AddUserCard` (admin only)

- `UsersTable.tsx`: role colors (lines 37–42); search + All/Active/Inactive filters; row menu → Make Admin/Manager/Agent, Deactivate/Activate (via `onUpdateRole` / `onToggleStatus`).
- `AddUserCard.tsx`: roles `["admin","manager","agent"]`, email regex, password ≥6 chars, submits `{name,email,phone,password,role}`.
- Backend (`backend/app/routers/user.py`): list/get/agents for admin+manager; create/update/delete **admin only**; 409 on duplicate email (line 98); password hashed on create (line 110).

### 6.8 Admin / Configurable modules (all admin-only in the UI)

- **Roles** — `RolesManager.tsx`: `GET /api/roles/all` (normalizes array-or-`{items}`, lines 26–27), system roles can't be deleted (lines 42–45). `RoleEditModal.tsx`: loads modules + permissions in parallel (lines 53–55), permission `Set`, module tri-state checkbox (lines 89–97), save `POST`/`PUT /api/roles` with `permission_ids` (lines 106–117).
- **Permissions** — `PermissionsMatrix.tsx`: loads `/api/permissions/matrix` + `/api/roles` (lines 31–34), read-only check/minus grid.
- **Forms** — `FormBuilder.tsx`: 14 field types (lines 20–35), `GET /api/forms/{id}` loads a 4-level form (form → sections → fields → options), full section/field/option CRUD + reordering, save re-indexes `sort_order` (lines 241–276) then `POST`/`PUT /api/forms`. `DynamicFormRenderer.tsx` renders a published form via the public `GET /api/forms/{formId}/render` (line 83), validates (required/pattern/min/max length) and submits a payload keyed by **field label** (lines 135–139).
- **Statuses** — `StatusManager.tsx`: `GET /api/config/statuses?per_page=100`, 10-color palette (lines 15–18), entity_type select (lead/property/project), CRUD; reorder buttons are stubs (lines 235–247).
- **Lead Sources** — `LeadSourceManager.tsx`: icon picker (lines 15–23), CRUD `/api/config/lead-sources`.
- **Notifications** — `NotificationManager.tsx`: tabs templates|rules, parallel load (lines 47–50), template form (channel email/sms/push/whatsapp, `{{var}}` placeholders, comma-separated variables), rule form (trigger_event, template select, recipients), CRUD.
- **Workflows** — `WorkflowBuilder.tsx`: step types notification/email/sms/wait/assign/condition (lines 15–22), trigger events (lead_created, lead_status_changed, follow_up_due, follow_up_overdue, property_added, lead_assigned, lines 24–31), CRUD `/api/workflows`, step add/move/remove, toggle active.
- **Company** — `CompanySettings.tsx`: `GET /api/company` (line 39), form fields with INR / Asia/Kolkata defaults (lines 20–30), save `PUT` or `POST /api/company` (lines 66–70).

---

## 7. Backend Reference (every router)

Routers are mounted in `backend/app/main.py:60–75`. Common pattern: `require_role`, `paginate()`, ordered `created_at DESC`, string micro-time ids (`LD-`, `PR-`, `PJ-`, `UR-`, `MOD-`, `ROL-`, `PERM-`, `RP-`, `FRM-`, `SEC-`, `FLD-`, `OPT-`, `STS-`, `LDS-`, `DW-`, `NTF-`, `NTR-`, `WFL-`, `WFS-`, `COM-`, `FU-`).

| Router | Prefix | Endpoints (method + roles) |
| --- | --- | --- |
| `user.auth_router` | `/api/auth` | POST login (public), GET me (any auth) |
| `user.router` | `/api/users` | GET agents (admin,manager); GET list/get (admin,manager, search/status); POST (admin, 409 dup email); PUT/DELETE (admin) |
| `lead.router` | `/api/leads` | GET list/get (all roles, search name/phone/id, status filter); POST (all roles); PUT/DELETE (admin,manager) |
| `property.router` | `/api/properties` | GET list/get (all roles, search title/location); POST/PUT/DELETE (admin,manager) |
| `project.router` | `/api/projects` | GET list/get (all roles, search name/developer/location); POST/PUT/DELETE (admin,manager) |
| `dashboard.router` | `/api/dashboard` | GET stats (all roles) |
| `follow_up.router` | `/api/follow-ups` | CRUD (all roles) |
| `module.router` | `/api/modules` | GET list/get (admin,manager); POST/PUT/DELETE (admin) |
| `role.router` | `/api/roles` | GET list (admin,manager); GET all (hydrated permissions); GET id (hydrated); POST/PUT/DELETE (admin; PUT/DELETE blocked for `is_system`) |
| `role.permission_router` | `/api/permissions` | GET (admin,manager, optional module_id); GET matrix (stub — all `False`, role.py:248); POST/DELETE (admin) |
| `form.router` | `/api/forms` | GET list/all (admin,manager); GET id (nested); **GET id/render (public)**; POST/PUT/DELETE (admin) |
| `company.router` | `/api/company` | GET (public); POST/PUT (admin) |
| `workflow.router` | `/api/workflows` | GET list/id (admin,manager, steps hydrated); POST/PUT/DELETE (admin) |
| `notification.router` | `/api/notifications` | templates + rules CRUD (GET admin,manager; write admin) |
| `config.router` | `/api/config` | statuses CRUD (+ public `all`); lead-sources CRUD (+ public `all`) |
| `dropdown.router` | `/api/dropdowns` | options CRUD (GET admin,manager; write admin); `GET /all` (public, optional `category`); `GET /list` (public — master dropdown registry) |
| `public.router` | `/api/public` | `POST /leads` (public lead capture → forces source Website / status New / assigned Unassigned) |
| `dashboard_config.router` | `/api/dashboard-config` | widgets CRUD (+ public `all`); `my-dashboard` GET/PUT (any auth, auto-creates) |

### Startup behavior (`backend/app/main.py:22–47`)

- `run_migrations()` runs `alembic upgrade head` in an executor thread.
- `startup_init()` runs migrations then `seed_users()` — both wrapped in try/except (logged, never fatal).
- Fired as a background task on lifespan start (doesn't block boot). `Procfile`/Dockerfile also run migrations pre-uvicorn.

---

## 8. Configurable SaaS Spine

The "configurable" system is data-driven and fully CRUD-able through the API and admin UI:

- **Modules** → **Permissions** → **RolePermissions** → **Roles**
  - `modules`: name, unique slug, is_active.
  - `permissions`: `module_id` (string ref), `action` (view/create/edit/delete/export), `name` = `${module_slug}_${action}`.
  - `role_permissions`: joins `role_id` + `permission_id` with `UniqueConstraint` (model line 12).
  - `roles`: name, unique slug, `hierarchy_level`, `is_system` (protects from edit/delete).
  - **Enforcement note:** only `require_role()` on the strings admin/manager/agent guards routes. The DB permission matrix is not consulted — see §10.
- **Forms** (4-level nesting): `forms` → `form_sections` → `form_fields` (with `validation_rules`/`metadata` JSONB) → `field_options`. Public rendering via `/render`.
- **Workflows**: `workflows` → `workflow_steps` (JSON `config`); CRUD only, no execution engine.
- **Notifications**: `notification_templates` (channels, `{{var}}`) + `notification_rules` (trigger_event, template_id, recipients, conditions); CRUD only, no dispatcher.
- **Statuses / Lead Sources**: seeded + manageable; `statuses` keyed by `entity_type` (lead/property/project) with slug/color/sort_order; `lead_sources` unique slug.
- **Dashboard widgets**: `dashboard_widgets` (widget_type stat/table/list, JSON `config`) + per-user `user_dashboards` (`widgets`/`layout` JSONB, auto-created on first read).

---

## 9. Data Model Overview

All tables use string PKs + `created_at`/`updated_at`; **no ForeignKeys** — relations are loose string columns with hand-coded cascade deletes.

| Model | Key fields | Notes |
| --- | --- | --- |
| `users` | name, email (unique), phone, role, status, created (string), hashed_password | role is a free string, not enum |
| `leads` | name, phone, email, budget, area, type, source, status (free string), assigned, date (string), requirement, property_id, assigned_to | status/source not FK-linked |
| `properties` | title, location, price (string), bedrooms, bathrooms, area, type, status, images (JSON), featured, project_id | price stored as text like "1.2 Cr" |
| `projects` | name, developer, location, status, total_units, units_sold, launch_date/completion_date (strings), price_range, description | |
| `follow_ups` | lead_id, lead_name, property_title, assigned_to, status (Today/Tomorrow/… bucket), time, note | follow-up bucket ≠ lead status |
| `modules` / `permissions` / `role_permissions` / `roles` | slug-based spine, see §8 | |
| `forms` / `form_sections` / `form_fields` / `field_options` | 4-level nesting, JSONB rules/metadata | |
| `workflows` / `workflow_steps` | JSONB config, sort_order | |
| `notification_templates` / `notification_rules` | JSONB variables/recipients/conditions | |
| `statuses` / `lead_sources` | entity_type, slug, color/sort_order; unique slug | |
| `dropdowns` / `dropdown_options` | master registry (key/label) + per-dropdown options (category=key, value/color/sort_order) | |
| `dashboard_widgets` / `user_dashboards` | JSONB config/layout | |
| `companies` | name, logo, email, phone, address, gst_number, currency (INR), timezone, working_hours, settings (JSONB), is_active | single active company |

Money is always text; `backend/app/money.py` parses "Cr/Lakh/M/K" strings (`parse_inr_price`, line 19) and formats back (`format_inr`, line 34). Only used by `dashboard.py` for `revenue_mtd`.

Seed (`backend/app/seed.py`) is idempotent and runs at every startup: 3 demo users (line 323), 6 modules (118), 8 roles (129), permissions × 5 actions with per-role carve-outs (140), 14 lead statuses upserted by slug (183), 10 lead sources (199), 9 dashboard widgets (210), 4 notification templates (223), and sample data: 15 leads / 10 properties / 5 projects / 8 follow-ups, each record deduped by natural key (287–320).

---

## 10. Known Gaps & Notes (read before changing behavior)

1. **RBAC is decorative.** The seeded permissions/role_permissions matrix is CRUD-able and shown in admin UIs, but route guards only use the role string. `GET /api/permissions/matrix` returns an all-`False` stub (`role.py:248`). DB roles like `super_admin`/`read_only` have no effect on API access.
2. **Loose semantics:** lead `status` is free text ("Hot") while the `statuses` table uses slugs ("hot"); `Lead.date` and `User.created` are display strings, not timestamps; follow-up `status` is a bucket, not a lead status.
3. **No data-level integrity:** no FKs — deleting a module/status doesn't clean up dependents. Deleting a dropdown option keeps any record that already uses that value.
4. **Static placeholder UI:** CustomerProfile "Recommended Properties"/"Properties Viewed"/"Next Follow-up" and the dashboard quick stats (12.5% conversion, 2.4 hrs) are hardcoded, not computed from data.
5. **Public endpoints (no auth):** `POST /api/auth/login`, `POST /api/public/leads`, `GET /api/company`, `GET /api/forms/{id}/render`, `GET /api/config/statuses/all`, `GET /api/config/lead-sources/all`, `GET /api/dropdowns/all`, `GET /api/dropdowns/list`, `GET /api/dashboard-config/widgets/all`, `GET /`.

---

## Appendix — Demo Credentials

Seeded at startup (`backend/app/seed.py:323`):

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@estatecrm.com` | `admin123` |
| Manager | `manager@estatecrm.com` | `manager123` |
| Agent | `agent@estatecrm.com` | `agent123` |
