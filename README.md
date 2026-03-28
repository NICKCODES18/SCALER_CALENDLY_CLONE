# Calendly Clone — Scaler assignment

A web app for **event types**, **weekly availability**, **public booking** (month calendar + time slots), and a **meetings** view (upcoming / past / cancel). The UI follows **Calendly** patterns (clean spacing, **#006bff** blue, sidebar, cards).

- **Marketing landing:** `/`
- **Host app (scheduling):** `/scheduling` (event types)
- **Public booking:** `/book/:slug`

## Tech stack

| Layer | Technology |
|--------|------------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7, TanStack Query, Axios, Radix UI primitives, Sonner toasts |
| Backend | Node.js, Express 5, Prisma 5, PostgreSQL |
| Auth (optional) | JWT, Google OAuth (optional), dev email login (optional) |

## Assumptions (assignment / demo)

1. **Default host user (no login)** — With `USE_DEFAULT_USER=true` on the backend and `VITE_USE_DEFAULT_USER=true` on the frontend, the **Scheduling**, **Availability**, and **Meetings** areas behave as if a single user is signed in. No password or OAuth is required to use the host UI. The public booking page **`/book/:slug`** stays **open** (no login).
2. **Calendar in-app** — Bookings are stored in PostgreSQL. **Google Calendar / Zoom / email** integrations are **not** included in this scope (listed as bonus / future work).
3. **Timezone** — The host can set a display timezone on the Availability page; slot generation uses the server’s date + stored weekly rules (see code for details).
4. **Double booking** — The API rejects creating a second booking for the same `eventTypeId`, `date`, and `startTime` when status is `scheduled`.

## Database schema (high level)

- **User** — Host profile (`id`, `email`, `name`, …).
- **EventType** — Name, duration (minutes), unique **slug** (public URL segment), scoped by `userId`.
- **Availability** — Rows per `eventTypeId`: `dayOfWeek` (0=Sun … 6=Sat), `startTime`, `endTime`.
- **Booking** — Invitee `name`, `email`, `date`, `startTime`, `endTime`, `status`, `eventTypeId`.

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL (local or Docker)
- npm

### 1. Database

Create a database (e.g. `calendly`) and set `DATABASE_URL` in `BACKEND/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/calendly"
```

### 2. Backend

```bash
cd BACKEND
npm install
npx prisma migrate deploy
npm run seed
npm run dev
```

API listens on **http://127.0.0.1:5000** by default (`PORT` in `.env`).

**Health checks:** `GET /health` or `GET /api/health` → `{ "ok": true }`

### 3. Frontend

```bash
cd FRONTEND
npm install
npm run dev
```

Open **http://localhost:5173** (or the port Vite prints). Set `VITE_API_URL` in `FRONTEND/.env` to your API base (e.g. `http://127.0.0.1:5000`) if you are not using the Vite dev proxy.

### 4. Environment flags (host without login)

**BACKEND/.env**

```env
USE_DEFAULT_USER=true
DEFAULT_USER_ID=1
DEFAULT_USER_EMAIL=demo@calendly.local
```

The seeded user must use the same `id` as `DEFAULT_USER_ID` (seed uses `1`).

**FRONTEND/.env**

```env
VITE_USE_DEFAULT_USER=true
```

To turn on **real login** later, set `USE_DEFAULT_USER=false`, implement or use JWT + `POST /api/auth/dev-login` or Google, and set `VITE_USE_DEFAULT_USER=false`.

## Feature checklist (spec)

| Requirement | Status |
|-------------|--------|
| Event types: name, duration, unique slug | Yes |
| Edit / delete event types | Yes |
| List event types on Scheduling page | Yes |
| Unique public link per event type (`/book/:slug`) | Yes |
| Availability: days of week + time ranges | Yes |
| Timezone selection for host | Yes (Availability page) |
| Public booking: month calendar, slots, form | Yes |
| No double-booking same slot | Yes (API) |
| Confirmation after booking | Yes |
| Meetings: upcoming / past | Yes |
| Cancel meeting | Yes |
| Responsive layout | Partial (Tailwind; refine as needed) |
| Email / buffers / overrides / reschedule | Not in scope (bonus) |

## Project layout

```
SCALER/
  BACKEND/     Express API, Prisma schema, migrations, seed
  FRONTEND/    Vite + React SPA
```

## Original work

This project is built for the assignment as described; do not submit copied solutions from public Calendly clone repositories.

## License

ISC (see package files).
