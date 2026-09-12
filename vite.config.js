import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// Cada área tiene su banco de pruebas aislado. Ver docs/desarrollo.md
const paginas = ['index', 'editor-demo', 'ui-demo', 'openui-demo', 'artifact-demo']

export default defineConfig({
  plugins: [vue(), tailwindcss()],
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
  server: {
    // Los proxies existen solo para no exponer las API keys en el navegador.
    // Ver docs/arquitectura.md
    proxy: {},
  },
})
