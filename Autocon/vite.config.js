import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
    proxy: {
      // REST proxy: /api/binance/... → https://api.binance.com/...
      '/api/binance': {
        target: 'https://api.binance.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/binance/, ''),
      },
      // WebSocket proxy: /ws/binance/ws/... → wss://stream.binance.com:9443/ws/...
      // Prevents browser CORS blocks on direct wss:// connections in development
      '/ws/binance': {
        target: 'wss://stream.binance.com:9443',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/ws\/binance/, ''),
      },
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
