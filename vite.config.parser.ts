import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/scripts/parser.ts'),
      formats: ['iife'],
      name: 'parser',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'scripts/parser.js',
      },
    },
  },
});
