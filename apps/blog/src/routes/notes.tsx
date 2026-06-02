import { distanceToNow } from '@duyet/libs/date'
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
      <header className="mx-auto max-w-2xl px-6 pt-16 pb-10 md:pt-24 md:pb-12">
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

      <div className="mx-auto max-w-2xl px-6 pb-24">
        {shortforms.length === 0 ? (
          <p className="py-20 text-center text-sm text-[var(--rd-text-3)]">
            No notes log found.
          </p>
        ) : (
          <div className="flex flex-col">
            {shortforms.map((note) => (
              <Link
                key={note.id}
                to="/note/$id/"
                params={{ id: note.id }}
                className="group -mx-3 flex items-start gap-4 rounded-[var(--rd-r)] px-3 py-5 no-underline transition-colors hover:bg-[var(--rd-surface-2)]"
              >
                <div className="min-w-0 flex-1">
                  <time className="block text-[11.5px] font-mono uppercase tracking-[0.12em] text-[var(--rd-text-3)]">
                    {distanceToNow(note.date)}
                  </time>
                  <h2 className="mt-1.5 text-[1.05rem] font-[560] leading-snug tracking-[-0.02em] text-[var(--rd-text)] transition-colors group-hover:text-[var(--rd-accent-ink)]">
                    {note.title || note.excerpt}
                  </h2>
                  {note.title ? (
                    <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-[1.55] text-[var(--rd-text-2)]">
                      {note.excerpt}
                    </p>
                  ) : null}
                </div>
                <svg
                  className="mt-1 h-3.5 w-3.5 shrink-0 text-[var(--rd-text-4)] transition-all duration-200 group-hover:translate-x-[3px] group-hover:text-[var(--rd-accent)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
