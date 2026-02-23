import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, 'frontend'),
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: resolve(__dirname, 'frontend/dist'),
    emptyOutDir: true,
  },
})
