import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" }
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["mockups", "mockups/*", "@/../mockups/*"],
              message: "Production code must not import prototype files."
            }
          ]
        }
      ]
    }
  },
  prettier,
  globalIgnores([
    ".next/**",
    ".lighthouseci/**",
    ".tmp/**",
    "coverage/**",
    "playwright-report/**",
    "reports/lighthouse/**",
    "test-results/**"
  ])
]);
