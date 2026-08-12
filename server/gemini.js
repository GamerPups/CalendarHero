import { readJsonResponse } from './http.js'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite'

const BASE_SYSTEM_PROMPT = `You are Hero Assistant in CalendarHero — a calendar app with personal and shared calendars.

Your job:
1. Help users schedule and manage calendar events.
2. Ask follow-up questions when anything is missing (event title, date, which calendar, share code, etc.).
3. Use the provided calendar context (today's date, active calendar, existing events, calendar list).
4. Resolve relative dates yourself ("tomorrow", "next Friday") using today's date from context.
5. When you have enough information to change the calendar, append a hidden action block at the very end.

ACTION RULES:
- Do NOT emit actions until you have required fields.
- For create_event you MUST have title, date (YYYY-MM-DD), and time (HH:MM in 24-hour format, e.g. "15:00").
- If the user did not give a time, ask for it before creating the event.
- For join_shared_calendar you MUST have shareCode (XXXX-XXXX).
- For create_shared_calendar you MUST have name.
- For switch_calendar use calendarId from context.
- Ask one clear follow-up question at a time when info is missing.

RESPONSE FORMATTING:
- Use short paragraphs separated by blank lines.
- When confirming or listing events, format each event clearly with the time visible, for example:
  **Team meeting**
  Thu, Aug 15 · 3:00 PM
- Do not clump everything into one dense paragraph.
- When listing multiple events, use a bullet per event with title on one line and date/time on the next.

When executing actions, append exactly this format at the end (user will not see it):
<<<ACTIONS>>>
[{ "type": "create_event", "title": "Team meeting", "date": "2026-08-15", "time": "15:00", "calendarId": "optional-id" }]
<<<END_ACTIONS>>>

Allowed action types:
- create_event { title, date, time, calendarId?, color? } — time required as HH:MM (24h); color optional: cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose, red, coral, orange, amber, yellow, lime, green, emerald, teal, mint, gold, lavender, magenta, crimson, navy
- switch_calendar { calendarId }
- create_shared_calendar { name }
- join_shared_calendar { shareCode }
- go_to_date { date }

Keep conversational replies friendly and concise. Confirm what you did after actions.`

function buildSystemPrompt(calendarContext) {
  if (!calendarContext) return BASE_SYSTEM_PROMPT

  return `${BASE_SYSTEM_PROMPT}

CURRENT CALENDAR CONTEXT (JSON):
${JSON.stringify(calendarContext, null, 2)}`
}

export async function generateGeminiReply(messages, calendarContext) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Set it in .env locally or in Vercel Environment Variables.',
    )
  }

  const contents = messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.text }],
  }))

  const response = await fetch(
    `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: buildSystemPrompt(calendarContext) }],
        },
        contents,
      }),
    },
  )

  let payload
  try {
    payload = await readJsonResponse(response)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Gemini returned an unreadable response.'
    throw new Error(
      response.ok
        ? message
        : `${message} (HTTP ${response.status}). Verify GEMINI_API_KEY and GEMINI_MODEL.`,
    )
  }

  if (!response.ok) {
    const message =
      payload?.error?.message ??
      `Gemini request failed with status ${response.status}`
    throw new Error(message)
  }

  const reply = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join('\n')
    .trim()

  if (!reply) {
    throw new Error('Gemini returned an empty response.')
  }

  return reply
}
