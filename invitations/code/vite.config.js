import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: resolve(__dirname, '../images'),
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        family: resolve(__dirname, 'family.html'),
        friends: resolve(__dirname, 'friends.html'),
      },
    },
  },
  server: {
    open: '/family.html',
  },
});
