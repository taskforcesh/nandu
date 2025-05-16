import { defineConfig, loadEnv } from "vite";
import solidPlugin from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [tailwindcss(), solidPlugin()],
    build: {
      target: "esnext",
      polyfillDynamicImport: false,
    },
    // Make env variables available to the client-side code
    define: {
      "import.meta.env.VITE_API_HOST": JSON.stringify(
        env.VITE_API_HOST || "http://localhost:4567"
      ),
    },
    // Add CORS configuration to allow frontend to connect to the backend
    server: {
      proxy: {
        // Proxy API requests to the backend service
        "/api": {
          target: env.VITE_API_HOST || "http://localhost:4567",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
