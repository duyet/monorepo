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
        "home",
        "insights",
        "photos",
        "travel",
        // Auth-related changes
        "auth",
        // CI-related changes
        "ci",
        // UI-related changes
        "ui",
        // Rust-related changes
        "rust",
        // Docs-related changes
        "docs",
        // Library-related changes
        "lib",
        // Agent-related changes
        "agents",
        // LLM Timeline app
        "llm-timeline",
        // Homelab app
        "homelab",
        // Knowledge Base app
        "kb",
        // Shared packages (components, libs, etc.)
        "ui",
      ],
    ],
    "scope-empty": [1, "never"],
  },
};
