import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build runs from any sub-path (GitHub Pages, previews)
  base: './',
  plugins: [react()],
})
