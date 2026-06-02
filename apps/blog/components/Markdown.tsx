import { cn } from '@duyet/libs/utils'
import { marked } from 'marked'
import type { ReactElement } from 'react'

// Obsidian `![[embed]]` images are already resolved to standard `![alt](url)`
// markdown upstream in lib/shortforms.ts (where Vite knows the hashed asset
// URLs), so the renderer only deals with ordinary markdown. We use `marked`
// (a real, eval-free parser — CSP-safe, unlike runtime MDX) and then post-
// process its HTML for two project-specific touches: image/link styling and
// grouping adjacent images into a full-bleed gallery row.

const GALLERY_CLASS =
  'not-prose relative left-1/2 my-8 w-screen -translate-x-1/2 grid items-start gap-6 px-8 grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))]'

/**
 * Group >=2 adjacent standalone images (each emitted by marked as
 * `<p><img></p>`) into one full-bleed, responsive gallery row. `auto-fit` lets
 * CSS decide same-row vs multi-row by viewport width; a lone image is untouched.
 */
function groupImageRows(html: string): string {
  return html.replace(/(?:<p>\s*<img[^>]*>\s*<\/p>\s*){2,}/g, (block) => {
    const cells = (block.match(/<img[^>]*>/g) ?? [])
      .map((img) =>
        img
          .replace(/\sclass="[^"]*"/, '')
          .replace(/^<img\s/, '<img class="m-0 block h-auto w-full rounded-lg" ')
      )
      .join('')
    return `<div class="${GALLERY_CLASS}">${cells}</div>`
  })
}

function render(source: string): string {
  const raw = marked.parse(source, { async: false, gfm: true }) as string
  const styled = raw
    .replace(/<img\s/g, '<img class="rounded-lg max-w-full my-4" ')
    .replace(
      /<a\s+href=/g,
      '<a target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-semibold" href='
    )
  return groupImageRows(styled)
}

export function Markdown({
  source,
  className,
}: {
  source: string
  className?: string
}): ReactElement {
  const html = render(source)

  return (
    <div
      className={cn('prose dark:prose-invert max-w-none', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
