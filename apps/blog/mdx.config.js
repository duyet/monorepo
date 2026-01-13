/** @type {import('@next/mdx').MDXConfig} */
module.exports = {
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [
      require('remark-gfm'),
      require('remark-math'),
      require('remark-directive')
    ],
    rehypePlugins: [
      require('rehype-slug'),
      require('rehype-autolink-headings'),
      require('rehype-highlight'),
      require('rehype-katex')
    ],
    providerImportSource: '@mdx-js/react',
  },
}