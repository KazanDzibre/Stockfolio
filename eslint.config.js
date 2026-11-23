// eslint.config.js: ESLint "flat config" (the current format; .eslintrc is legacy).
// ESLint finds bugs and bad patterns. Prettier (separate tool) handles formatting.

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig(
  // Never lint build output, coverage reports, or dependencies.
  globalIgnores(["**/dist/**", "**/coverage/**", "**/node_modules/**"]),

  // ESLint's core recommended rules for plain JavaScript (e.g. no unreachable code).
  eslint.configs.recommended,

  // typescript-eslint rules that USE TYPE INFORMATION. Slower than the basic set, but it catches
  // the bugs that matter most in a Node backend, especially:
  //  - no-floating-promises: calling an async function without await or .catch(),
  //    so its errors are silently lost
  //  - no-misused-promises: passing an async function where a sync callback is expected
  //    (a classic Express bug)
  tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        // For each file, find the nearest tsconfig.json automatically to get type information.
        projectService: true,
        // Resolve tsconfig paths relative to this file (the repo root).
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    // Plain .js files (like this config file) aren't in any tsconfig,
    // so turn off the type-aware rules for them.
    files: ["**/*.js", "**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  {
    rules: {
      // Unused variables are a warning, not an error, so they don't block you mid-work.
      // Prefix a name with _ to say "unused on purpose" (e.g. Express's _next parameter).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Require `import type` for type-only imports. Pairs with verbatimModuleSyntax in tsconfig:
      // the linter auto-fixes what the compiler would otherwise reject.
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },

  // MUST BE LAST: turns off every ESLint rule that conflicts with Prettier's formatting,
  // so the two tools never argue.
  prettierConfig,
);
