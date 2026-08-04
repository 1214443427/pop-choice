import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "../shared"),
    },
  },
  test: {
    setupFiles: ["./src/test/setup.ts"],
    environment: "jsdom",
  },
  // server: {
  //   fs: {
  //     allow: [".."],
  //   },
  // },
});
