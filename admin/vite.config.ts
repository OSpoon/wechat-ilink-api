import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
    plugins: [vue()],
    base: env.VITE_BASE_PATH || '/',
    server: {
      port: 18080,
      watch: {
        // Native fs.watch can hit EMFILE on macOS and mounted/container filesystems.
        usePolling: true,
        interval: 1000,
        ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      },
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY || 'http://localhost:13333',
          changeOrigin: true,
        },
        '/health': {
          target: env.VITE_API_PROXY || 'http://localhost:13333',
          changeOrigin: true,
        },
      },
    },
    build: {
      sourcemap: mode !== 'production',
    },
  }
})
