import { generateGeminiReply } from './gemini.js'

export function registerApiRoutes(router) {
  router.get('/health', (_req, res) => {
    res.json({
      ok: true,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      model: process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite',
    })
  })

  router.post('/chat', async (req, res) => {
    const messages = req.body?.messages

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required.' })
    }

    const valid = messages.every(
      (message) =>
        message &&
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.text === 'string' &&
        message.text.trim().length > 0,
    )

    if (!valid) {
      return res.status(400).json({ error: 'Each message needs role and text.' })
    }

    const calendarContext = req.body?.calendarContext

    try {
      const reply = await generateGeminiReply(messages, calendarContext)
      res.json({ reply })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gemini request failed.'
      res.status(502).json({ error: message })
    }
  })
}
