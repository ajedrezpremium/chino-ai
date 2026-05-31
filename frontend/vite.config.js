import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['chino-avatar.png'],
      manifest: {
        name: "Chiño AI — O teu colega celeste",
        short_name: "Chiño AI",
        description: "O primeiro axente de intelixencia artificial oficial dun club de fútbol. Historiador celeste, bar buddy e colega de bancada.",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "gl",
        icons: [
          { src: "/chino-avatar.png", sizes: "192x192", type: "image/png" },
          { src: "/chino-avatar.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,json,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/kxfokjtfzdznvfykumxy\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'supabase-api', expiration: { maxEntries: 50, maxAgeSeconds: 300 } }
          },
          {
            urlPattern: /^https:\/\/openrouter\.ai\/api\/.*/i,
            handler: 'NetworkOnly',
            options: { cacheName: 'openrouter-api' }
          }
        ]
      }
    })
  ],
  server: { port: 3000, host: true }
})
