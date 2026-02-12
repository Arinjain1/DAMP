import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Use default Vite port
    host: true
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
})
