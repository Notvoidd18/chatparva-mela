import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./apps/web/src/setupTests.ts"],
    include: [
      "apps/*/src/**/*.test.{ts,tsx}",
      "packages/*/src/**/*.test.{ts,tsx}",
    ],
  },
});
