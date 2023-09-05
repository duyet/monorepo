module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        // Dependency-related changes
        'deps',
        // Post
        'post',
        // Prettier-related changes
        'blog',
        // TypeScript-related changes
        'cv',
        // CI-related changes
        'ci',
        // UI-related changes
        'ui',
        // Rust-related changes
        'rust',
        // Docs-related changes
        'docs',
      ],
    ],
    'scope-empty': [1, 'never'],
  },
}
