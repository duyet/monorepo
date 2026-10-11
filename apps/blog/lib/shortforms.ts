import { parseShortform } from '@/lib/shortform-parse'

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

export interface Shortform {
  id: string
  date: Date
  title?: string
  x?: string
  hackerNews?: string
  body: string
  excerpt: string
}

function toShortform(path: string, raw: string): Shortform {
  const note = parseShortform(path.split('/').pop()!, raw, attachmentUrl)
  return { ...note, date: new Date(note.date) }
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
