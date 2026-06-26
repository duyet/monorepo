import { ArrowRight } from 'lucide-react'
import type { LinkComponent } from '@tanstack/react-router'
import { distanceToNow } from '@duyet/libs/date'
import { CornerDecoration } from './CornerDecoration'
import type { Shortform } from '@/lib/shortforms'

interface NoteCardProps {
  note: Shortform
  featured: boolean
  Link: LinkComponent<any>
  padding?: 'normal' | 'large'
  headingLevel?: 'h2' | 'h3'
  variant?: 'homepage' | 'notes'
  showExcerpt?: boolean
}

export function NoteCard({
  note,
  featured,
  Link,
  padding = 'normal',
  headingLevel = 'h3',
  variant = 'homepage',
  showExcerpt = false,
}: NoteCardProps) {
  const Heading = headingLevel
  const paddingClass = padding === 'large' ? 'p-6' : 'p-5'

  // Featured card spans differ by variant
  const featuredClass =
    variant === 'homepage'
      ? 'md:col-span-3'
      : 'md:col-span-2 xl:col-span-1 xl:row-span-2'

  const titleText = note.title || note.excerpt

  // Excerpt: only show if it differs from the title and isn't redundant
  const excerptText =
    showExcerpt && note.excerpt && note.excerpt !== titleText
      ? note.excerpt
      : null

  return (
    <Link
      to="/note/$id/"
      params={{ id: note.id }}
      className={`group/bento relative flex items-center justify-between ${paddingClass} overflow-hidden bg-[var(--rd-surface)] no-underline transition-colors hover:bg-[var(--rd-surface-2)] ${
        featured ? `${featuredClass} bg-[var(--rd-accent-bg)]` : ''
      }`}
    >
      {featured && <CornerDecoration />}

      <div className="flex-1 min-w-0">
        <Heading className="text-[var(--rd-text)] mb-1 text-base font-semibold leading-snug">
          {titleText}
        </Heading>
        {excerptText && (
          <p className="mt-1.5 mb-1 text-[13px] leading-relaxed text-[var(--rd-text-2)] line-clamp-2">
            {excerptText}
          </p>
        )}
        <time className="text-[var(--rd-text-3)] font-mono text-xs tabular-nums">
          {distanceToNow(note.date)}
        </time>
      </div>

      <ArrowRight
        className="ml-3 h-4 w-4 shrink-0 text-[var(--rd-accent-ink)] transition-transform duration-150 group-hover/bento:translate-x-0.5"
        size={16}
      />
    </Link>
  )
}
