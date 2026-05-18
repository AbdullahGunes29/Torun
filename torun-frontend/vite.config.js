import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // Eğer projedeki tailwind yapın farklıysa bu satıra dokunma

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000, // Frontend'in çalışacağı port
    proxy: {
      // Tarayıcıdaki CORS engellerini aşmak için backend proxy kurulumu
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});