import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    copyPublicDir: false,
    lib: {
      entry: 'src/index.js',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: [
        /^pdfjs-dist(\/.*)?$/,
        'react',
        'react-dom',
        'react/jsx-runtime'
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        exports: 'named'
      }
    },
    sourcemap: true,
    minify: true
  }
})
