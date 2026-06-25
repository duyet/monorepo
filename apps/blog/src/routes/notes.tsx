import { distanceToNow } from '@duyet/libs/date'
import { createFileRoute, Link } from '@tanstack/react-router'
import type { ReactElement } from 'react'
import { getShortforms } from '@/lib/shortforms'
import type { Shortform } from '@/lib/shortforms'
import { NoteCard } from '@/components/blog/NoteCard'

export const Route = createFileRoute('/notes')({
  head: () => ({
    meta: [
      { title: 'Quick Notes | Tôi là Duyệt' },
      { name: 'description', content: 'Short-form thoughts and updates.' },
    ],
  }),
  loader: () => {
    const shortforms = getShortforms()
    return { shortforms }
  },
  component: NotesPage,
})

function NotesPage(): ReactElement {
  const { shortforms } = Route.useLoaderData() as { shortforms: Shortform[] }

  return (
    <div className="min-h-screen bg-[var(--rd-bg)]">
      <header className="mx-auto max-w-6xl px-6 pt-16 pb-10 md:pt-24 md:pb-12">
        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--rd-text-3)]">
          Logbook
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[var(--rd-text)] sm:text-4xl">
          Quick Notes
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--rd-text-2)]">
          A stream of short-form updates, software learnings, code snippets, and
          daily thoughts.
        </p>
      </header>

      <div className="mx-auto max-w-6xl px-6 pb-24">
        {shortforms.length === 0 ? (
          <p className="py-20 text-center text-sm text-[var(--rd-text-3)]">
            No notes log found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-px overflow-visible border border-[var(--rd-border)] bg-[var(--rd-border)] md:grid-cols-2 xl:grid-cols-[5fr_3fr_3fr]">
            {shortforms.map((note, index) => {
              const isFeatured = index === 0

              return (
                <NoteCard
                  key={note.id}
                  note={note}
                  featured={isFeatured}
                  Link={Link}
                  padding="large"
                  headingLevel="h2"
                  variant="notes"
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
