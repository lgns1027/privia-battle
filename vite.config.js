import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // GitHub Pages 상대 경로 배포 지원
  server: {
    port: 3000,
    open: true
  }
});
