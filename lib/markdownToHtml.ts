import type { VFileCompatible } from 'vfile'

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeFormat from 'rehype-format'
import rehypeStringify from 'rehype-stringify'

export default async function markdownToHtml(markdown: VFileCompatible) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(markdown)

  return result.toString()
}
