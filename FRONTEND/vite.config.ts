import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const apiProxy = {
  '/api': {
    // 127.0.0.1 avoids some Windows/IPv6 proxy issues with localhost
    target: 'http://127.0.0.1:5000',
    changeOrigin: true,
  },
} as const

export default defineConfig({
  server: {
    proxy: { ...apiProxy },
  },
  // `vite preview` does not inherit `server.proxy` — without this, `/api/*` returns 404.
  preview: {
    proxy: { ...apiProxy },
  },
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
