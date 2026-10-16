import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      // Proxy de desarrollo: el front y la API comparten origen → las cookies httpOnly funcionan sin CORS
      proxy: {
        '/api': { target: env.VITE_API_PROXY_TARGET || 'http://localhost:3000', changeOrigin: true },
      },
    },
  }
})
