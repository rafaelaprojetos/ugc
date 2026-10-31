import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { pluginMidias } from './plugins/midias.ts'

export default defineConfig({
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
