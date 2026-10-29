import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA, type ManifestOptions } from 'vite-plugin-pwa'
import manifest from './manifest.json'

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icon.svg', 'icons/apple-touch-icon.png'],
      // Edit manifest.json; the plugin emits it as manifest.webmanifest and links it in index.html.
      manifest: manifest as Partial<ManifestOptions>,
    }),
  ],
})
