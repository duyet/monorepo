import { cn } from '@duyet/libs/utils'
import type { ReactElement } from 'react'

function parseMarkdownToHtml(markdown: string): string {
  let html = markdown

  // 1. Code blocks (```lang ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang}">${code}</code></pre>`
  })

  // 2. Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // 3. Images (![alt](url))
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg max-w-full my-4" />')

  // 4. Links ([text](url))
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-semibold">$1</a>')

  // 5. Blockquotes (> text)
  html = html.replace(/^\s*>\s*(.+)$/gm, '<blockquote>$1</blockquote>')
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '<br />')

  // 6. Headers (# text)
  html = html.replace(/^\s*#{6}\s*(.+)$/gm, '<h6>$1</h6>')
  html = html.replace(/^\s*#{5}\s*(.+)$/gm, '<h5>$1</h5>')
  html = html.replace(/^\s*#{4}\s*(.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^\s*#{3}\s*(.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^\s*#{2}\s*(.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^\s*#{1}\s*(.+)$/gm, '<h1>$1</h1>')

  // 7. Bold (**text**)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // 8. Italics (*text*)
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // 9. Unordered lists (- item or * item). Use horizontal whitespace only:
  //    `\s*` would let `^` start the match on a preceding blank line and eat its
  //    newline, gluing the list onto the previous paragraph and turning the
  //    inter-item `\n`s into `<br />`.
  html = html.replace(/^[ \t]*[-*][ \t]+(.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
  html = html.replace(/<\/ul>\s*<ul>/g, '\n')

  // 10. Group adjacent image-only blocks into one full-bleed row; wrap the rest
  //     as paragraphs. Two or more consecutive `![[img]]` embeds become a wide
  //     gallery that breaks out of the prose column; a lone image is unchanged.
  const blocks = html
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
  const isImageOnly = (p: string) => /^<img\b[^>]*>$/.test(p)

  const out: string[] = []
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    if (isImageOnly(block)) {
      const run: string[] = []
      while (i < blocks.length && isImageOnly(blocks[i])) run.push(blocks[i++])
      i-- // step back: the for-loop will re-increment
      out.push(run.length > 1 ? renderImageRow(run) : run[0])
      continue
    }
    if (/^(<pre|<h|<blockquote|<ul|<li)/.test(block)) {
      out.push(block)
    } else {
      out.push(`<p>${block.replace(/\n/g, '<br />')}</p>`)
    }
  }
  return out.join('')
}

/**
 * Render >=2 adjacent images as a full-bleed gallery that breaks out of the
 * prose column. Column count is decided by CSS, not JS: `auto-fit` + `minmax`
 * packs as many >=16rem columns as the viewport allows and wraps the rest onto
 * new rows — so three shots sit on one row on desktop and stack on a phone.
 *
 * Tailwind classes (not inline styles) work here because this `.tsx` file is in
 * the Tailwind content globs; the class strings below are scanned verbatim.
 */
function renderImageRow(imgs: string[]): string {
  const cells = imgs
    .map((img) =>
      img.replace(/\sclass="[^"]*"/, ' class="m-0 block h-auto w-full rounded-lg"')
    )
    .join('')
  return (
    '<div class="not-prose relative left-1/2 my-8 w-screen -translate-x-1/2 ' +
    'grid items-start gap-6 px-8 ' +
    'grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))]">' +
    `${cells}</div>`
  )
}

export function Markdown({
  source,
  className,
}: {
  source: string
  className?: string
}): ReactElement {
  const html = parseMarkdownToHtml(source)

  return (
    <div
      className={cn('prose dark:prose-invert max-w-none', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
