# CalendarHero

Standalone calendar app with personal/shared calendars and a Gemini-powered Hero Assistant.

## Run locally

1. Copy `.env.example` to `.env` and add your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Features

- **Personal & shared calendars** — start fresh with one personal calendar; add or join more anytime
- **Share codes** — shared calendars use `XXXX-XXXX` codes; join via button or chat
- **Events** — add manually or through Hero Assistant; shown on the live month grid with times
- **Month navigation** — Today, previous/next month, click any day to jump there
- **Hero Assistant (Gemini)** — asks follow-up questions, creates events, switches calendars, creates/joins shared calendars
- **Event colors** — pick a default color for new events
- **PWA** — install on mobile or desktop for home-screen / app-like access and offline UI

## Install as an app (PWA)

**Mobile (Chrome / Edge / Samsung Internet):** open the site → menu → **Install app** or **Add to Home screen**.

**Desktop (Chrome / Edge):** look for the install icon in the address bar, or use the in-app **Install CalendarHero** banner.

Your calendars and events are saved in the browser automatically.

## Gemini setup

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Required for Hero Assistant |
| `GEMINI_MODEL` | Optional, defaults to `gemini-3.5-flash-lite` |
| `PORT` | API port, defaults to `3001` |

### Vercel deployment

1. Deploy the repo on Vercel (framework preset: **Vite**).
2. In Vercel → **Project Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` — your key from [Google AI Studio](https://aistudio.google.com/apikey)
   - `GEMINI_MODEL` — optional, e.g. `gemini-3.5-flash-lite`
3. Redeploy after saving env vars.

The `/api/chat` and `/api/health` routes run as Vercel serverless functions in production.

## Scripts

- `npm run dev` — frontend + built-in API (recommended)
- `npm run dev:all` — frontend + separate API process on port 3001
- `npm run build` — production build with PWA service worker

## Try the assistant

Examples:

- "Schedule team meeting tomorrow at 3pm"
- "Add lunch on Friday at noon"
- "Create a shared calendar called Roommates"
- "Join calendar ABCD-1234"

The assistant will ask follow-ups when title, date, time, or calendar is unclear, then update your calendar automatically.
