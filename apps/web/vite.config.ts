import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Tailwind 4 chạy qua plugin Vite, KHÔNG còn dùng postcss.config.js
  // và cũng không còn tailwind.config.js — mọi thứ khai báo trong CSS.
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },

  server: {
    port: 5173,
    // Chuyển tiếp mọi lời gọi /api sang backend để trình duyệt coi như cùng
    // một nguồn — nhờ vậy không phải cấu hình CORS khi phát triển.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
});
