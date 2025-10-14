import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3002,
    open: true
  },
  resolve: {
    alias: {
      '@shared': '../shared'
    }
  },
  publicDir: '../shared/assets'
});
