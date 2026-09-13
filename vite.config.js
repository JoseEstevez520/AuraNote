import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { textoASVG } from './server/omnisvg.mjs'

// Cada área tiene su banco de pruebas aislado. Ver docs/desarrollo.md
const paginas = ['index', 'editor-demo', 'ui-demo', 'openui-demo', 'artifact-demo', 'omnisvg-demo']

// Plugin de desarrollo: expone POST /api/omnisvg para llamar a OmniSVG con el
// HF_TOKEN del lado del servidor (nunca en el navegador). Es solo para dev; en
// producción esto viviría en un backend real. Ver docs/arquitectura.md
function omnisvgDev(env) {
  return {
    name: 'omnisvg-dev',
    configureServer(server) {
      process.env.HF_TOKEN = process.env.HF_TOKEN || env.HF_TOKEN || ''
      server.middlewares.use('/api/omnisvg', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end('Method Not Allowed')
        }
        let cuerpo = ''
        req.on('data', (c) => (cuerpo += c))
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json')
          try {
            const { description, modelSize } = JSON.parse(cuerpo || '{}')
            const svg = await textoASVG(description, { modelSize: modelSize || '4B' })
            res.end(JSON.stringify({ svg }))
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: e.message }))
          }
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [vue(), tailwindcss(), omnisvgDev(env)],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    build: {
      rollupOptions: {
        input: Object.fromEntries(
          paginas.map((n) => [n, fileURLToPath(new URL(`./${n}.html`, import.meta.url))]),
        ),
      },
    },
    server: { proxy: {} },
  }
})
