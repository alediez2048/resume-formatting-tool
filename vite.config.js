import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/resume-formatting-tool/',
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  }
})

