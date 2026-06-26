import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vue') || id.includes('node_modules/pinia') || id.includes('node_modules/vue-router')) {
            return 'vue-vendor';
          }
          if (id.includes('node_modules/apexcharts') || id.includes('node_modules/vue3-apexcharts')) {
            return 'chart-vendor';
          }
          if (id.includes('node_modules/lucide') || id.includes('node_modules/sweetalert2') || id.includes('node_modules/axios')) {
            return 'ui-vendor';
          }
        }
      }
    }
  }
})
