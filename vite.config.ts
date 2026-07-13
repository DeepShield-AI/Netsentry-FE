import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// NetSentry dashboard build config.
//
// In dev mode (npm run dev), Vite serves the SPA on :5173 and proxies
// /api/* and /metrics to the local probe agent + capture metrics endpoint.
// This keeps the browser origin single-origin (no CORS handshake needed).
//
// In production we emit a static `dist/` that the Go agent can serve from
// `:7080/ui/` via http.FileServer; see probe/dashboard/README.md.
export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // When served by the Go agent at /ui/, all asset URLs need to be relative
  // to that prefix.  In dev (mode === 'development') we keep the default '/'
  // so HMR works.
  base: mode === 'production' ? '/ui/' : '/',
  server: {
    port: 5173,
    proxy: {
      // Agent REST API. Adjust target if your probe runs on a different host.
      '/api': {
        target: 'http://127.0.0.1:7080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        timeout: 3000,
      },
      // Capture-side Prometheus metrics.
      '/metrics': {
        target: 'http://127.0.0.1:9201',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split heavy deps into their own chunks so the first paint
        // doesn't pull in 1.2 MB of vendor code.
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('echarts') || id.includes('zrender')) return 'echarts'
          if (id.includes('element-plus') || id.includes('@element-plus'))
            return 'element-plus'
          if (id.includes('vue-router') || id.includes('/pinia/')) return 'vue-router-pinia'
          if (id.includes('/vue/')) return 'vue'
          return 'vendor'
        },
      },
    },
  },
}))
