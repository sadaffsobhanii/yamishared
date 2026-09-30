import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { chatTurn } from './server/chat'
import { onboardTurn } from './server/onboard'

// Serves the Claude-backed endpoints from the dev server so the API key stays out of the browser.
function claudeApi(): Plugin {
  const routes: Record<string, (body: never) => Promise<unknown>> = {
    '/api/onboard': onboardTurn,
    '/api/chat': chatTurn,
  }
  return {
    name: 'yami-claude-api',
    configureServer(server) {
      for (const [path, handler] of Object.entries(routes)) {
        server.middlewares.use(path, (req, res) => {
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
              res.end(JSON.stringify(await handler(JSON.parse(raw) as never)))
            } catch (error) {
              server.config.logger.error(`[${path}] ${error instanceof Error ? error.message : String(error)}`)
              res.statusCode = 502
              res.end(JSON.stringify({ error: 'upstream' }))
            }
          })
        })
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (env.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY

  return {
    plugins: [react(), claudeApi()],
    server: {
      port: 5173,
      host: '127.0.0.1',
    },
  }
})
