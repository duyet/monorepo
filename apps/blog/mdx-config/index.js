const remarkGfm = require("remark-gfm");
const remarkMath = require("remark-math");
const rehypeKatex = require("rehype-katex");
const rehypeSlug = require("rehype-slug");
const rehypeCodeTitles = require("rehype-code-titles");

module.exports = {
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [rehypeKatex, rehypeSlug, rehypeCodeTitles],
  },
};