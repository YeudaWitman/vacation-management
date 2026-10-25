import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      // The browser calls /api/... on the Vite port (5173). Vite forwards it to the CEF backend
      // on 8888 and removes the /api prefix. Same origin for the browser, so no CORS problems
      // (the CEF dev server does not allow PATCH or a custom Authorization header cross-origin).
      "/api": {
        target: "http://localhost:8888",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
