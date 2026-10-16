import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { readMeal } from './server/vision'

// Serves /api/vision from the dev server so the Claude key stays out of the browser.
// The single-file build has no server, so there the camera falls back to the on-device reader.
function visionApi(): Plugin {
  return {
    name: 'yami-vision-api',
    configureServer(server) {
      server.middlewares.use('/api/vision', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        if (!process.env.ANTHROPIC_API_KEY) {
          res.statusCode = 503
          res.end(JSON.stringify({ error: 'no-key' }))
          return
        }
        if (req.method === 'GET') {
          res.end(JSON.stringify({ ok: true }))
          return
        }
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        let raw = ''
        req.on('data', chunk => (raw += chunk))
        req.on('end', async () => {
          try {
            res.end(JSON.stringify(await readMeal(JSON.parse(raw))))
          } catch (error) {
            server.config.logger.error(`[vision] ${error instanceof Error ? error.message : String(error)}`)
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
    plugins: [react(), viteSingleFile(), visionApi()],
  }
})
