import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-three':  ['three', 'globe.gl', 'react-globe.gl'],
          'vendor-ethers': ['ethers'],
        },
      },
    },
  },
})
