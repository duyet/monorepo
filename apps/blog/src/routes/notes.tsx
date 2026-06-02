import { distanceToNow } from '@duyet/libs/date'
import { createFileRoute, Link } from '@tanstack/react-router'
import { type ReactElement, Suspense } from 'react'
import { getShortforms } from '@/lib/shortforms'
import type { Shortform } from '@/lib/shortforms'
import { Markdown } from '@/components/Markdown'

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
    <div className="min-h-screen bg-background">
      <header className="mx-auto max-w-3xl px-6 pt-16 pb-12 md:pt-24 md:pb-16 border-b border-border/40">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
          LOGBOOK
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Quick Notes
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-xl">
          A stream of short-form updates, software learnings, code snippets, and daily thoughts.
        </p>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        {shortforms.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-lg bg-muted/20">
            <p className="text-sm text-muted-foreground">No notes log found.</p>
          </div>
        ) : (
          <div className="relative border-l border-border/60 ml-4 space-y-12 pb-8">
            {shortforms.map((note) => (
              <article key={note.id} className="relative pl-8 sm:pl-10 group">
                {/* Timeline Dot */}
                <div className="absolute -left-4 top-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-all group-hover:border-foreground/30">
                  <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>

                {/* Card Container */}
                <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm hover:border-foreground/20 hover:shadow-md transition-all duration-200 p-6">
                  {/* Card Header Info */}
                  <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-border/40 text-xs font-mono text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Duyet Le</span>
                      <span>•</span>
                      <span>{distanceToNow(note.date)}</span>
                    </div>
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-semibold uppercase">
                      Note
                    </span>
                  </div>

                  {/* Title */}
                  {note.title ? (
                    <h2 className="text-xl font-bold tracking-tight text-foreground mb-3">
                      {note.title}
                    </h2>
                  ) : null}

                  {/* Markdown Content */}
                  <div className="prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed text-foreground/90">
                    <Suspense
                      fallback={
                        <p className="whitespace-pre-wrap">{note.body}</p>
                      }
                    >
                      <Markdown source={note.body} />
                    </Suspense>
                  </div>

                  {/* Card Footer Link */}
                  <div className="mt-6 pt-4 border-t border-border/40 flex justify-between items-center text-xs font-mono text-muted-foreground">
                    <span>{note.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <Link
                      to="/note/$id/"
                      params={{ id: note.id }}
                      className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors hover:underline"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                      </svg>
                      Permalink
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
