import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy 0x API requests to avoid CORS issues
      '/api/0x': {
        target: 'https://api.0x.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/0x/, '/swap'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            // Add 0x API headers
            if (process.env.VITE_0X_API_KEY && process.env.VITE_0X_API_KEY !== 'YOUR_0X_API_KEY') {
              proxyReq.setHeader('0x-api-key', process.env.VITE_0X_API_KEY);
            }
            proxyReq.setHeader('0x-version', 'v2');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
