import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // Capacitor serves files from the app bundle, so use relative asset paths.
  base: './',
  server: {
    // The native projects contain copies of the built app; don't watch or reload on them.
    watch: { ignored: ['**/android/**', '**/ios/**'] },
  },
  optimizeDeps: {
    entries: ['index.html'],
  },
})
