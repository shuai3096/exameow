import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import rootPackageJson from '../package.json'

export default defineConfig({
  plugins: [vue()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(rootPackageJson.version),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      external: ['@tauri-apps/plugin-dialog'],
    },
  },
  clearScreen: false,
  server: {
    port: 5273,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
})
