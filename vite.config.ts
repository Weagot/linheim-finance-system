import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ensure NODE_ENV is not "production" during dev to avoid Vite errors
if (process.env.NODE_ENV === 'production' && !process.argv.includes('build')) {
  process.env.NODE_ENV = 'development'
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
