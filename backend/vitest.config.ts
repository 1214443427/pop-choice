import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: { environment: "node", setupFiles: ["./src/test/setup.ts"] },
  resolve: { alias: { "@shared": resolve(__dirname, "../shared") } },
});
