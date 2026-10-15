import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import { qrcode } from 'vite-plugin-qrcode'

import { cloudflare } from "@cloudflare/vite-plugin";
import { seo } from './seo-plugin'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare(), qrcode(), seo()],
  server: {
    host: true, // Enable network access
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
})