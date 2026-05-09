import { defineConfig } from "vitest/config"
import { fileURLToPath } from "url"
import path from "path"

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.tsx"],
    include: ["src/**/*.test.{ts,tsx}"],
    globals: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src"),
    },
  },
})
