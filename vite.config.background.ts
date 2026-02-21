import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/scripts/background.ts'),
      formats: ['iife'],
      name: 'background',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'scripts/background.js',
      },
    },
  },
});
