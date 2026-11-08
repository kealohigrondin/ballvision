import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
export default defineConfig({
  base: "/ballvision/",
  plugins: [react()],
  test: { environment: "jsdom" },
});
