import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import path from 'node:path'

// For relative-path builds (ARTIFACT=1) rewrite absolute /img/ references so images load from any sub-path
const relativeImages = {
  name: 'relative-images',
  transform(code: string, id: string) {
    if (!process.env.ARTIFACT || !/\/src\/.*\.(t|j)sx?$/.test(id)) return
    return code.replace(/(['"`])\/img\//g, '$1./img/')
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss(), relativeImages],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts') || id.includes('d3-')) return 'charts'
          if (id.includes('gsap') || id.includes('lenis')) return 'motion'
        },
      },
    },
  },
})
