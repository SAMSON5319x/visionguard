import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'VisionGuard',
        short_name: 'VisionGuard',
        description: 'Smart Assistive Dashboard',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
})
