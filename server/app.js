import express from 'express'
import cors from 'cors'
import { generateGeminiReply } from './gemini.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      model: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
    })
  })

  app.post('/api/chat', async (req, res) => {
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

  return app
}
