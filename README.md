# PONS Dashboard

Mobile-first revenue intelligence dashboard. Voice-first interface for detecting revenue leaks, scoring leads, and prioritizing deals.

## Features

- **Connect Data Source**: Salesforce, HubSpot, Pipedrive, Zoho, GoHighLevel
- **Run Revenue Audit**: ~30 second pipeline analysis
- **Leak Detection Cards**: Severity badges, revenue at risk, SLA breach alerts
- **Voice Mode**: Lightning orb interface for hands-free interaction
- **Chat Interface**: PONS Analyst with Fast Response / Deep Reasoning modes
- **Manager Mode**: Executive intelligence tier (gold accent)
- **PWA Support**: Install as mobile app

## Quick Start

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your API URL and Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | PONS API backend URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

## Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel

# Or connect GitHub repo to Vercel for auto-deploys
```

### Manual Build

```bash
npm run build
npm start
```

## Project Structure

```
app/
  page.tsx              # Connect Data Source
  layout.tsx            # Root layout with AppProvider
  globals.css           # PONS design system
  dashboard/
    layout.tsx          # Dashboard layout with nav
    page.tsx            # Audit button + results
    voice/page.tsx      # Voice mode interface
    chat/page.tsx       # PONS Analyst chat
lib/
  api.ts               # API client
  store.tsx            # App state (React Context)
  supabase.ts          # Supabase client
  utils.ts             # Utility functions
```

## Design System

- **Background**: Pure black (#000000)
- **Blue Accent**: #3b82f6 (selections, standard mode)
- **Gold Accent**: #f59e0b (manager mode, premium)
- **Red**: #ef4444 (critical alerts, leaks)
- **Cards**: #1a1a1a with #2a2a2a borders

## API Integration

Dashboard expects PONS API v2.0.0 endpoints:

- `POST /connect` - Test CRM connection
- `POST /leaks` - Full leak analysis
- `POST /leaks/summary` - Quick summary
- `POST /reps/kpis` - Rep performance data
- `POST /reports/executive` - AI executive report

## License

Proprietary - PONS Solutions
