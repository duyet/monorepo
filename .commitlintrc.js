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
        // Rust-related changes
        'rust',
      ],
    ],
    'scope-empty': [1, 'never'],
  },
}
