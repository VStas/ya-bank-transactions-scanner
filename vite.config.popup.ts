import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/popup.ts'),
      formats: ['iife'],
      name: 'popup',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'popup.js',
      },
    },
  },
});
