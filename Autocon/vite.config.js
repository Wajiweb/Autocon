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
  // Phase 6: Code Splitting — Separate heavy vendor libraries from application code
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'web3-vendor': ['ethers'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'react-hot-toast'],
          'monaco-vendor': ['@monaco-editor/react'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'syntax-vendor': ['react-syntax-highlighter'],
          'pdf-vendor': ['jspdf', 'jspdf-autotable', 'html2canvas']
        }
      }
    }
  }
})
