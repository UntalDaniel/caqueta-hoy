import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // nombre del repo para GitHub Pages (ajusta si lo cambias)
  base: '/ProyectoFinalG1_Rangel_Daniel/',
  plugins: [react()],
  build: {
    outDir: 'docs',
  },
})
