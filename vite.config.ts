import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  base: "/ballvision/",
  plugins: [react()],
  test: { environment: "jsdom" },
});
