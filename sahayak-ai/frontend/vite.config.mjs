import path from "path";
import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, ".."), "");
  const apiTarget = env.VITE_API_URL || "http://127.0.0.1:5000";
  return {
    root: __dirname,
    publicDir: "public",
    server: {
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: "dist",
      emptyOutDir: true
    }
  };
});
