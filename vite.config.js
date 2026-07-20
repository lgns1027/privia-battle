import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    target: 'es2015',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
  },
  server: {
    port: 3000,
    open: true
  }
});
