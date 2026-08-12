export function getGeminiSetupMessage(): string {
  if (import.meta.env.DEV) {
    return 'Add GEMINI_API_KEY to CalendarHero/.env and restart npm run dev.'
  }

  return 'Add GEMINI_API_KEY in your Vercel project → Settings → Environment Variables, then redeploy.'
}

export function getChatUnavailableMessage(): string {
  if (import.meta.env.DEV) {
    return 'Chat API is unavailable. Run npm run dev from the CalendarHero folder.'
  }

  return 'Chat API is unavailable. Check that the latest deployment succeeded on Vercel.'
}
