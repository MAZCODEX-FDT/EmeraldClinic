import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import path from 'node:path'

// Absolute /img/ references in the code follow the build's base path:
// ARTIFACT=1 (relative build, GitHub Pages) → ./img/, MAZMED=1 (served by MazMed under /_site/) → /_site/img/
const imagesPrefix = process.env.MAZMED ? '/_site/img/' : process.env.ARTIFACT ? './img/' : null
const relativeImages = {
  name: 'relative-images',
  transform(code: string, id: string) {
    if (!imagesPrefix || !/\/src\/.*\.(t|j)sx?$/.test(id)) return
    return code.replace(/(['"`])\/img\//g, `$1${imagesPrefix}`)
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
