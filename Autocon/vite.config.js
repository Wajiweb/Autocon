import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    fs: {
      allow: [
        path.resolve(__dirname, '../shared'),
        path.resolve(__dirname, '.'),
        path.resolve(__dirname, 'node_modules'),
      ],
    },
  },
})
