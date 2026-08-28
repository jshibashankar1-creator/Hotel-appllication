import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  publicDir: 'public',
  server: {
    host: 'localhost',
    port: 3001,
    strictPort: true,
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
