import dotenv from 'dotenv'
import { createApp } from './app.js'

dotenv.config()

const PORT = process.env.PORT ?? 3001
const app = createApp()

app.listen(PORT, () => {
  console.log(`CalendarHero API running at http://localhost:${PORT}`)
  console.log(
    process.env.GEMINI_API_KEY
      ? 'Gemini: connected via public Google API'
      : 'Gemini: set GEMINI_API_KEY in .env to enable chat',
  )
})
