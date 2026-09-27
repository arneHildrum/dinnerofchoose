import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiProxy = {
  '/api': {
    target: 'http://backend:5000',
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 4173,
    proxy: apiProxy,
  },

  preview: {
    host: '0.0.0.0',
    allowedHosts: ['dinnerofchoose'],
    port: 4173,
    strictPort: true,
    proxy: apiProxy,
  },
});