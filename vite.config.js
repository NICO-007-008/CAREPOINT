import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  base: './',
  optimizeDeps: {
    exclude: ['@ionic/core'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
      external: ['/ionic.esm.js'],
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@ionic/core/dist/ionic/*',
          dest: '',
        },
      ],
    }),
  ],
})