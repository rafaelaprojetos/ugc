import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { pluginMidias } from './plugins/midias.ts'

/**
 * Onde o site vai morar. Em domínio próprio é a raiz ('/'); no GitHub Pages
 * de projeto é '/nome-do-repositorio/'. O workflow preenche BASE_PATH sozinho
 * com o que o próprio Pages informa — você não precisa mexer.
 */
const base = process.env.BASE_PATH
  ? `/${process.env.BASE_PATH.replace(/^\/|\/$/g, '')}/`.replace('//', '/')
  : '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), pluginMidias()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
    cssMinify: 'lightningcss',
  },
})
