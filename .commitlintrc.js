module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      [
        // Dependency-related changes
        "deps",
        // Post
        "post",
        // App changes
        "blog",
        "cv",
        "insights",
        "travel",
        // CI-related changes
        "ci",
        // UI-related changes
        "ui",
        // Rust-related changes
        "rust",
        // Docs-related changes
        "docs",
      ],
    ],
    "scope-empty": [1, "never"],
  },
};
