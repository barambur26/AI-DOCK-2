import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: true
  },
  // Path resolution for clean imports
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // Build configuration for deployment
  build: {
    // Continue build despite TypeScript errors
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress TypeScript warnings during build
        if (warning.code === 'PLUGIN_WARNING') return
        warn(warning)
      }
    }
  }
})
