import {
  parseFrontmatter,
  shortformId,
  toExcerpt,
} from '@/lib/shortform-parse'

const FILES = import.meta.glob('/_shortforms/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// Attachment images live next to the notes. Vite resolves each to a hashed
// URL so Obsidian-style `![[file.png]]` embeds can point at a real asset.
const ATTACHMENTS = import.meta.glob('/_shortforms/attachments/*', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>

function attachmentUrl(name: string): string | undefined {
  const target = name.trim()
  const entry = Object.entries(ATTACHMENTS).find(
    ([path]) => path.split('/').pop() === target
  )
  return entry?.[1]
}

/** Convert Obsidian embeds `![[file.png]]` / `![[file.png|alt]]` to markdown images. */
function resolveEmbeds(body: string): string {
  return body.replace(
    /!\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g,
    (whole, file: string, alt?: string) => {
      const url = attachmentUrl(file)
      if (!url) return whole
      return `![${(alt ?? file).trim()}](${url})`
    }
  )
}

export interface Shortform {
  id: string
  date: Date
  title?: string
  body: string
  excerpt: string
}

function toShortform(path: string, raw: string): Shortform {
  const filename = path.split('/').pop()!.replace(/\.md$/, '')
  const { date, title, slug, body } = parseFrontmatter(raw)
  const resolved = resolveEmbeds(body)
  return {
    id: shortformId(filename, slug),
    date: new Date(date),
    title,
    body: resolved,
    excerpt: toExcerpt(resolved),
  }
}

export function getShortformById(id: string): Shortform | null {
  for (const [path, raw] of Object.entries(FILES)) {
    const note = toShortform(path, raw)
    if (note.id === id) {
      return Number.isNaN(note.date.getTime()) ? null : note
    }
  }
  return null
}

export function getShortforms(limit?: number): Shortform[] {
  const all = Object.entries(FILES)
    .map(([path, raw]) => toShortform(path, raw))
    .filter((s) => !Number.isNaN(s.date.getTime()))
  all.sort((a, b) => b.date.getTime() - a.date.getTime())
  return limit ? all.slice(0, limit) : all
}
