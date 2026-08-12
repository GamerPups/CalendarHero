import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { registerApiRoutes } from './routes.js'

dotenv.config()

export function createApiRouter() {
  const router = express.Router()
  router.use(express.json({ limit: '1mb' }))
  registerApiRoutes(router)
  return router
}

export function createApp() {
  const app = express()
  app.use(cors())
  app.use('/api', createApiRouter())
  return app
}
