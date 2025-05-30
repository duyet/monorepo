/**
 * Some of Prettier's defaults can be overridden by an EditorConfig file. We
 * define those here to ensure that doesn't happen.
 *
 * See: https://github.com/prettier/prettier/blob/main/docs/configuration.md#editorconfig
 */
const overridableDefaults = {
  endOfLine: 'lf',
  tabWidth: 2,
  printWidth: 80,
  useTabs: false,
  singleQuote: true,
  semi: false,
}

/** @type {import("prettier").Config} */
module.exports = {
  ...overridableDefaults,
  plugins: [
    'prettier-plugin-packagejson',
    'prettier-plugin-organize-imports',
    'prettier-plugin-tailwindcss',
  ],
  tailwindConfig: '../../packages/tailwind-config/tailwind.config.mjs',
  tailwindFunctions: ['clsx', 'cn'],
}
