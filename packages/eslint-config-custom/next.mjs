import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import turboConfig from 'eslint-config-turbo/flat'
import eslintConfigPrettier from "eslint-config-prettier/flat"

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

const eslintConfig = [
  ...turboConfig,
  eslintConfigPrettier,
  ...compat.config({
    extends: ['next'],
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
    },
  }),
]

export default eslintConfig
