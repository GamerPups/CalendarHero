export default function handler(_req, res) {
  res.status(200).json({
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    model: process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite',
  })
}
