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

  // 9. Unordered lists (- item or * item)
  html = html.replace(/^\s*[-*]\s*(.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
  html = html.replace(/<\/ul>\s*<ul>/g, '\n')

  // 10. Paragraphs (double line breaks)
  const paragraphs = html.split(/\n\n+/)
  return paragraphs
    .map((p) => {
      p = p.trim()
      if (!p) return ''
      if (/^(<pre|<h|<blockquote|<ul|<li|<img)/.test(p)) return p
      return `<p>${p.replace(/\n/g, '<br />')}</p>`
    })
    .join('')
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
