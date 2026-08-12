import { generateGeminiReply } from '../server/gemini.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

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
    return res.status(200).json({ reply })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gemini request failed.'
    return res.status(502).json({ error: message })
  }
}
