import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import tseslint from "typescript-eslint"
import { FlatCompat } from "@eslint/eslintrc"

const compat = new FlatCompat({ baseDirectory: import.meta.dirname })

export default tseslint.config(
  { ignores: [".next", "node_modules", "out"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  ...compat.extends("next/core-web-vitals")
)
