/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transformIgnorePatterns: [
    "node_modules/(?!(unified|remark-.*|rehype-.*|micromark-.*|unist-.*|vfile.*|bail|is-plain-obj|trough|mdast-.*|hast-.*|trim-lines|property-information|space-separated-tokens|comma-separated-tokens|web-namespaces|zwitch)/)",
  ],
};
