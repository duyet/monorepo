import { ArrowRight } from 'lucide-react'
import type { LinkComponent } from '@tanstack/react-router'
import { distanceToNow } from '@duyet/libs/date'
import { CornerDecoration } from './CornerDecoration'
import type { Shortform } from '@/lib/shortforms'

interface NoteCardProps {
  note: Shortform
  featured: boolean
  Link: LinkComponent
  padding?: 'normal' | 'large'
  headingLevel?: 'h2' | 'h3'
  variant?: 'homepage' | 'notes'
}

export function NoteCard({
  note,
  featured,
  Link,
  padding = 'normal',
  headingLevel = 'h3',
  variant = 'homepage',
}: NoteCardProps) {
  const Heading = headingLevel
  const paddingClass = padding === 'large' ? 'p-6' : 'p-5'

  // Featured card spans differ by variant
  const featuredClass =
    variant === 'homepage'
      ? 'md:col-span-3'
      : 'md:col-span-2 xl:col-span-1 xl:row-span-2'

  return (
    <Link
      to="/note/$id/"
      params={{ id: note.id }}
      className={`group/bento relative flex flex-col overflow-hidden ${paddingClass} no-underline transition-colors hover:bg-[var(--rd-surface-1)] ${
        featured ? `${featuredClass} bg-accent-100/20` : ''
      }`}
    >
      {featured && <CornerDecoration />}

      <div className={`mb-3 flex items-center justify-between ${padding === 'large' ? 'mb-4' : 'mb-3'}`}>
        <time className="text-[var(--rd-text-3)] font-mono text-xs tabular-nums">
          {distanceToNow(note.date)}
        </time>
        {note.tags?.[0] && (
          <span className="text-[var(--rd-accent-ink)] font-mono text-xs tracking-widest uppercase">
            {note.tags[0]}
          </span>
        )}
      </div>

      <div className={`mb-4 flex-1 ${padding === 'large' ? 'mb-6' : 'mb-4'}`}>
        <Heading className="text-[var(--rd-text)] mb-2 text-base font-medium leading-snug md:text-lg">
          {note.title || note.excerpt}
        </Heading>
        {note.title && (
          <p className="text-[var(--rd-text-2)] line-clamp-2 text-sm leading-relaxed">
            {note.excerpt}
          </p>
        )}
      </div>

      <span className="text-[var(--rd-text-3)] inline-flex w-fit items-center gap-2 text-sm font-medium underline-offset-4 group-focus-within/bento:underline group-hover/bento:underline">
        {note.title ? 'Read note' : 'View more'}
        <ArrowRight
          className="h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover/bento:translate-x-0.5"
          size={14}
        />
      </span>
    </Link>
  )
}
