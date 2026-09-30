import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { onboardTurn } from './server/onboard'

// Serves /api/onboard from the dev server so the Claude API key stays out of the browser.
function onboardApi(): Plugin {
  return {
    name: 'yami-onboard-api',
    configureServer(server) {
      server.middlewares.use('/api/onboard', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        if (!process.env.ANTHROPIC_API_KEY) {
          res.statusCode = 503
          res.end(JSON.stringify({ error: 'no-key' }))
          return
        }
        let raw = ''
        req.on('data', (chunk) => (raw += chunk))
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json')
          try {
            res.end(JSON.stringify(await onboardTurn(JSON.parse(raw))))
          } catch (error) {
            server.config.logger.error(`[onboard] ${error instanceof Error ? error.message : String(error)}`)
            res.statusCode = 502
            res.end(JSON.stringify({ error: 'upstream' }))
          }
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (env.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY

  return {
    plugins: [react(), onboardApi()],
    server: {
      port: 5173,
      host: '127.0.0.1',
    },
  }
})
