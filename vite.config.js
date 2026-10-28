import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('canvas-confetti') || id.includes('marked') || id.includes('lucide-vue-next') || id.includes('vue')) {
              return 'vendor'
            }
          }
        }
      }
    }
  }
})

