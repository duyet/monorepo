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
              const isLarge = isFeatured || (index % 5 === 0 && index < shortforms.length - 1)

              return (
                <Link
                  key={note.id}
                  to="/note/$id/"
                  params={{ id: note.id }}
                  className={`group/bento relative flex flex-col overflow-hidden bg-[var(--rd-bg)] p-6 no-underline transition-colors hover:bg-[var(--rd-surface-1)] ${
                    isFeatured ? 'md:col-span-2 xl:col-span-1 xl:row-span-2' : ''
                  }`}
                  style={
                    isFeatured || isLarge
                      ? { gridColumn: isFeatured ? '1 / -1' : undefined }
                      : undefined
                  }
                >
                  {/* Corner decorations */}
                  {isFeatured && (
                    <>
                      <div
                        className="pointer-events-none absolute z-30 bg-[var(--rd-bg)]"
                        style={{
                          width: '14px',
                          height: '14px',
                          border: '1px solid var(--rd-border)',
                          borderRadius: '3px',
                          left: '-7px',
                          top: '-7px',
                        }}
                        aria-hidden="true"
                      />
                      <div
                        className="pointer-events-none absolute z-30 bg-[var(--rd-bg)]"
                        style={{
                          width: '14px',
                          height: '14px',
                          border: '1px solid var(--rd-border)',
                          borderRadius: '3px',
                          right: '-7px',
                          top: '-7px',
                        }}
                        aria-hidden="true"
                      />
                      <div
                        className="pointer-events-none absolute z-30 bg-[var(--rd-bg)]"
                        style={{
                          width: '14px',
                          height: '14px',
                          border: '1px solid var(--rd-border)',
                          borderRadius: '3px',
                          left: '-7px',
                          bottom: '-7px',
                        }}
                        aria-hidden="true"
                      />
                      <div
                        className="pointer-events-none absolute z-30 bg-[var(--rd-bg)]"
                        style={{
                          width: '14px',
                          height: '14px',
                          border: '1px solid var(--rd-border)',
                          borderRadius: '3px',
                          right: '-7px',
                          bottom: '-7px',
                        }}
                        aria-hidden="true"
                      />
                    </>
                  )}

                  <div className="mb-4 flex items-center justify-between">
                    <time className="text-[var(--rd-text-3)] font-mono text-xs tabular-nums">
                      {distanceToNow(note.date)}
                    </time>
                    {note.tags?.[0] && (
                      <span className="text-[var(--rd-accent-ink)] font-mono text-xs tracking-widest uppercase">
                        {note.tags[0]}
                      </span>
                    )}
                  </div>

                  <div className="mb-6 flex-1">
                    <h2 className="text-[var(--rd-text)] mb-2 text-base font-medium leading-snug md:text-lg">
                      {note.title || note.excerpt}
                    </h2>
                    {note.title && (
                      <p className="text-[var(--rd-text-2)] line-clamp-2 text-sm leading-relaxed md:line-clamp-3">
                        {note.excerpt}
                      </p>
                    )}
                  </div>

                  <span className="text-[var(--rd-text-3)] inline-flex w-fit items-center gap-2 text-sm font-medium underline-offset-4 group-focus-within/bento:underline group-hover/bento:underline">
                    {note.title ? 'Read note' : 'View more'}
                    <svg
                      className="h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover/bento:translate-x-0.5"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
