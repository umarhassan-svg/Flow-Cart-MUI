// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react"; // or @vitejs/plugin-react-swc if you prefer
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

/**
 * Vite config for Flow-Cart-MUI
 *
 * - Uses import.meta.env and VITE_ prefixed env vars (see Vite docs).
 * - Reads VITE_BASE_URL and VITE_BACKEND_URL from .env / mode files.
 * - Sets up a dev proxy for API calls to avoid CORS in development.
 * - Defines process.env.NODE_ENV for libs that expect it.
 */
export default defineConfig(({ mode }) => {
  // load environment variables for current mode (development/production)
  const env = loadEnv(mode, process.cwd(), "");
  // base URL for the app (use VITE_BASE_URL or fallback to '/')
  const base = env.VITE_BASE_URL || "/";
  const backendUrl = env.VITE_BACKEND_URL || ""; // expected in .env (VITE_BACKEND_URL)

  return {
    base,
    plugins: [
      react(), // fast refresh & JSX transform
      tsconfigPaths() // honors tsconfig path aliases automatically
    ],
    resolve: {
      alias: {
        // example alias: '@' -> src
        "@": path.resolve(__dirname, "src")
      },
      extensions: [".js", ".ts", ".jsx", ".tsx", ".json"]
    },
    // make some process.env.* available at build time where necessary
    // avoid exposing entire process.env; only provide NODE_ENV replacement
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode)
    },
    server: {
      port: Number(env.VITE_DEV_PORT || 5173),
      open: env.VITE_DEV_OPEN === "true" || false,
      // Proxy API requests during local development to your backend
      proxy: backendUrl
        ? {
            // Proxy /api/* to backend
            "/api": {
              target: backendUrl,
              changeOrigin: true,
              secure: backendUrl.startsWith("https"),
              // optional: rewrite if your backend expects different path
              // rewrite: (path) => path.replace(/^\/api/, ""),
            },
            // If your backend serves auth or socket endpoints at other prefixes, add them here.
          }
        : undefined
    },
    build: {
      outDir: "dist",
      sourcemap: env.VITE_SOURCEMAP === "true" || false,
      chunkSizeWarningLimit: 1500,
      // recommended for single-page-app deploys
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("@mui") || id.includes("material-ui")) {
                return "vendor_mui";
              }
              return "vendor";
            }
          }
        }
      }
    },
    // Optimize dependencies to avoid unexpected cold starts during dev
    optimizeDeps: {
      include: ["@mui/material", "@mui/icons-material", "react", "react-dom"]
    }
  };
});
