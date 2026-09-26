/**
 * ESLint configuration: catches likely bugs and bad patterns in JS.
 * Run with `npm run lint` (CI runs it on every push and pull request).
 *
 * Formatting (spacing, quotes, line length) is Prettier's job, not
 * ESLint's. `eslint-config-prettier` (last in the list) turns off any
 * ESLint rules that would conflict with Prettier.
 */
const js = require("@eslint/js");
const globals = require("globals");
const prettier = require("eslint-config-prettier");

module.exports = [
  // Build output, dependencies and third-party files aren't ours to lint.
  { ignores: ["dist/", "node_modules/", "src/vendor/"] },
  js.configs.recommended, // ESLint's standard set of bug-catching rules
  // App code: modern JS modules running in the browser.
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    rules: {
      // console.log is fine while debugging, but shouldn't ship.
      // console.error is allowed; we use it to log API failures.
      "no-console": ["warn", { allow: ["error"] }],
      "prefer-const": "error",
      // Require === instead of == (avoids surprising type coercion).
      eqeqeq: ["error", "always"],
    },
  },
  // Config files run in Node and use require()/module.exports.
  {
    files: ["*.config.js", "eslint.config.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
  },
  prettier,
];
