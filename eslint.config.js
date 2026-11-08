import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import globals from "globals";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import local from "./eslint-rules/index.js";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "test-results", "playwright-report"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser },
    },
    plugins: { local, "simple-import-sort": simpleImportSort },
    rules: {
      "local/padding-before-statements": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@typescript-eslint/no-explicit-any": "error",
      // Components destructure an empty props type by convention: ({}: FooProps)
      "no-empty-pattern": "off",
      // Existing violations need behavior-changing refactors; tighten to "error" once fixed.
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    files: ["playwright.config.ts", "e2e/**/*.ts"],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
  // After eslint-config-prettier, which turns curly off.
  { files: ["**/*.{ts,tsx}"], rules: { curly: ["error", "all"] } },
);
