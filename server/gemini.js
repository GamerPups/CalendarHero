const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash'

const BASE_SYSTEM_PROMPT = `You are Hero Assistant in CalendarHero — a calendar app with personal and shared calendars.

Your job:
1. Help users schedule and manage calendar events.
2. Ask follow-up questions when anything is missing (event title, date, which calendar, share code, etc.).
3. Use the provided calendar context (today's date, active calendar, existing events, calendar list).
4. Resolve relative dates yourself ("tomorrow", "next Friday") using today's date from context.
5. When you have enough information to change the calendar, append a hidden action block at the very end.

ACTION RULES:
- Do NOT emit actions until you have required fields.
- For create_event you MUST have title and date (YYYY-MM-DD).
- For join_shared_calendar you MUST have shareCode (XXXX-XXXX).
- For create_shared_calendar you MUST have name.
- For switch_calendar use calendarId from context.
- Ask one clear follow-up question at a time when info is missing.

When executing actions, append exactly this format at the end (user will not see it):
<<<ACTIONS>>>
[{ "type": "create_event", "title": "Team meeting", "date": "2026-08-15", "calendarId": "optional-id" }]
<<<END_ACTIONS>>>

Allowed action types:
- create_event { title, date, calendarId?, color? } — color: cyan|purple|green|blue
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
    throw new Error('GEMINI_API_KEY is not configured. Add it to .env and restart the server.')
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

  const payload = await response.json()

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
