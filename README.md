<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1JA4xljoFq7iQo5YCf4HWosRyZ5JgKHHx

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set required keys:
   - `GEMINI_API_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_MONTHLY`
   - `STRIPE_PRICE_ANNUAL`
   - `ENTITLEMENT_SECRET`
   - `APP_URL` (optional, fallback to request host)
   - `VITE_PONS_API_URL` (optional, defaults to `http://localhost:8080`)
3. Run the app:
   `npm run dev`
