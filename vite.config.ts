import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  base: '/METRON/',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: '404.html', dest: '.' }
      ]
    })
  ],
})
