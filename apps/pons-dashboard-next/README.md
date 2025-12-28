# PONS Dashboard (Next.js)

Executive dashboard for revenue leak analysis with CRM selection and Cloud Run integration.

## Run Locally

1. Install dependencies from repo root:
   `npm install`
2. In `apps/pons-dashboard-next`, create `.env.local` with:
   - `PUBLIC_API_BASE_URL` (Cloud Run base URL)
   - `API_AUTH_TOKEN` (server-only auth token)
3. Start the app:
   `npm run dev --workspace apps/pons-dashboard-next`

## Environment Variables

- `PUBLIC_API_BASE_URL` (required)
- `API_AUTH_TOKEN` (required, passed as Authorization header)

## Notes

- `/api/leaks/analyze` is proxied to Cloud Run to avoid CORS issues.
- The UI uses server components for layout/page and a small client component for the CRM selector + run button.
