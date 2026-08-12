import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import dotenv from 'dotenv'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { createApp } from './server/app.js'

dotenv.config()

const pwaManifest = JSON.parse(
  readFileSync(new URL('./public/site.webmanifest', import.meta.url), 'utf-8'),
)

function apiDevPlugin(): Plugin {
  return {
    name: 'calendar-hero-api',
    configureServer(server) {
      const app = createApp()

      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0] ?? ''
        if (!pathname.startsWith('/api')) {
          next()
          return
        }

        app(req, res, next)
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    apiDevPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icons/*.svg'],
      manifest: pwaManifest,
      manifestFilename: 'site.webmanifest',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,webmanifest}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
})
