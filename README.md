# PONS Dashboard (MVP)

An iPhone-first dashboard for connecting a CRM, running leak detection, and sharing ROI-driven results.

## Next.js Dashboard

There is a Next.js App Router dashboard located at `apps/pons-dashboard-next`.

Quick start:
1. `npm install`
2. `cp apps/pons-dashboard-next/.env.example apps/pons-dashboard-next/.env.local`
3. Set `PUBLIC_API_BASE_URL`, `API_AUTH_TOKEN`, and `NODE_ENV`
4. `npm run dev --workspace apps/pons-dashboard-next`

## Run Locally

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set values.
3. Start the dev server:
   `npm run dev`

## Required Environment Variables

Frontend runtime config (Cloud Run + auth gate):

- `NEXT_PUBLIC_API_BASE_URL` (Cloud Run base URL, e.g. `https://pons-api-xyz.a.run.app`)
- `APP_PASSWORD` (simple password gate for `/app` routes)

Optional:

- `NEXT_PUBLIC_API_KEY` (x-api-key header; if missing, the UI will prompt for a key and store in localStorage)
- `VITE_PONS_API_URL` (legacy fallback for local development)

## MVP Flow

1. `/app/connect` → select CRM + paste token (stored in localStorage for now).
2. `/app/run` → calls `POST /api/leaks?crm=...`.
3. `/app/results` → summary KPIs, leak list, next actions, report export.

## Vercel Setup

1. Set environment variables:
   - `NEXT_PUBLIC_API_BASE_URL`
   - `APP_PASSWORD`
   - `NEXT_PUBLIC_API_KEY` (optional)
2. Redeploy the project.
3. Open `/app` and unlock using `APP_PASSWORD`.

## Notes

- If env vars are missing at runtime, the app shows a setup screen instead of crashing.
- No backend changes are required in this repo.
