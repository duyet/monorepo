import { dateFormat, distanceToNow } from '@duyet/libs/date'
import { createFileRoute, Link } from '@tanstack/react-router'
import type { ReactElement } from 'react'
import { getShortforms } from '@/lib/shortforms'
import type { Shortform } from '@/lib/shortforms'

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

      <div className="mx-auto max-w-3xl px-6 pb-24">
        {shortforms.length === 0 ? (
          <p className="py-20 text-center text-sm text-[var(--rd-text-3)]">
            No notes log found.
          </p>
        ) : (
          <ul className="border-t border-[var(--rd-border)]">
            {shortforms.map((note) => (
              <li key={note.id}>
                <Link
                  to="/note/$id/"
                  params={{ id: note.id }}
                  className="group flex flex-col gap-1.5 border-b border-[var(--rd-border)] py-5 no-underline transition-colors hover:bg-[var(--rd-surface,transparent)] sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <time
                    dateTime={new Date(note.date).toISOString()}
                    className="shrink-0 font-mono text-xs tabular-nums text-[var(--rd-text-3)] sm:w-28 sm:pt-0.5"
                  >
                    {dateFormat(note.date, 'MMM d, yyyy')}
                  </time>
                  <div className="min-w-0 flex-1">
                    <h2 className="m-0 text-base font-semibold leading-snug tracking-[-0.01em] text-[var(--rd-text)] transition-colors group-hover:text-orange-600 dark:group-hover:text-orange-400">
                      {note.title ?? 'Note'}
                    </h2>
                    {note.excerpt && (
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--rd-text-2)]">
                        {note.excerpt}
                      </p>
                    )}
                    <span className="mt-1 inline-block text-xs text-[var(--rd-text-3)]">
                      {distanceToNow(note.date)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
