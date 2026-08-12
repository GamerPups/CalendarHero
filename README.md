# CalendarHero

Standalone calendar app with personal/shared calendars and a Gemini-powered Hero Assistant.

## Run locally

1. Copy `.env.example` to `.env` and add your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

```bash
npm install
npm run dev:all
```

Open http://localhost:5173

## Features

- **Personal & shared calendars** — switch via My Calendars / Shared dropdowns (both list all calendars)
- **Share codes** — shared calendars use `XXXX-XXXX` codes; join via button or chat
- **Events** — add manually or through Hero Assistant; shown on the live month grid
- **Month navigation** — Today, previous/next month, click any day to jump there
- **Hero Assistant (Gemini)** — asks follow-up questions, creates events, switches calendars, creates/joins shared calendars
- **Event colors** — pick a default color for new events

## Gemini setup

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Required for Hero Assistant |
| `GEMINI_MODEL` | Optional, defaults to `gemini-2.0-flash` |
| `PORT` | API port, defaults to `3001` |

## Scripts

- `npm run dev:all` — frontend + API (recommended)
- `npm run dev` — frontend only
- `npm run dev:server` — API only

## Try the assistant

Examples:

- "Schedule team meeting tomorrow at 3pm"
- "Add lunch on Friday to my Work calendar"
- "Create a shared calendar called Roommates"
- "Join calendar H3RO-C0DE"
- "Switch to Sample coders"

The assistant will ask follow-ups when title, date, or calendar is unclear, then update your calendar automatically.
