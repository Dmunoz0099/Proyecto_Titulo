// vite.config.js -> config de Vite (server de desarrollo y build).

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // plugin oficial de React (JSX, Fast Refresh, etc.)
  plugins: [react()],

  server: {
    // puerto del server de desarrollo del front
    port: 8099,

    // proxy: cuando el front pide "/api/...", Vite lo reenvía al backend en
    // http://localhost:4000. Así me ahorro el CORS en dev y no tengo que escribir
    // la URL completa del backend en el código.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
