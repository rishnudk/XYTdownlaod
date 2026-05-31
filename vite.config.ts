import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'index.html'),
        background: path.resolve(__dirname, 'src/background/index.ts'),
        'content/twitter': path.resolve(__dirname, 'src/content/twitter/index.ts'),
        'content/youtube': path.resolve(__dirname, 'src/content/youtube/index.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background.js';
          }
          if (chunkInfo.name.startsWith('content/')) {
            return `${chunkInfo.name}.js`;
          }
          return 'assets/[name]-[hash].js';
        },
      }
    }
  }
});
