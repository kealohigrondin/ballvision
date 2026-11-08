import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";
export default defineConfig({
  base: "/ballvision/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    // Playwright owns e2e/; Vitest would otherwise pick up its *.spec.ts files.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
