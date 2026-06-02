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
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-muted/20">
      <header className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center md:text-left">
        <p className="text-xs font-mono uppercase tracking-widest text-primary/80 font-bold">
          Quick Notes
        </p>
        <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
          Thoughts &amp; Snippets
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Real-time updates, micro-blogs, reference code blocks, and reflections.
        </p>
      </header>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-24">
        {shortforms.length === 0 ? (
          <div className="text-center py-20 border rounded-2xl bg-card/50 backdrop-blur-sm">
            <p className="text-lg text-muted-foreground">No notes found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {shortforms.map((note) => (
              <article
                key={note.id}
                className="relative group flex flex-col justify-between p-6 sm:p-8 bg-card border rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-foreground/30 transition-all duration-300 ease-out"
              >
                {/* Clickable link covering the whole card */}
                <Link
                  to="/note/$id/"
                  params={{ id: note.id }}
                  className="absolute inset-0 z-10"
                  aria-label={note.title || note.excerpt}
                />
                
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <time
                      dateTime={note.date.toISOString()}
                      className="text-xs font-mono text-muted-foreground"
                    >
                      {distanceToNow(note.date)}
                    </time>
                    <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                      NOTE
                    </span>
                  </div>

                  {note.title ? (
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-200 mb-3">
                      {note.title}
                    </h2>
                  ) : null}

                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base line-clamp-4">
                    {note.excerpt}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t flex items-center justify-between relative z-20">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted border font-mono text-[10px] font-bold text-muted-foreground">
                      DL
                    </div>
                    <span className="text-xs font-semibold text-foreground/80">
                      Duyet Le
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:underline">
                    Read full note
                    <svg
                      className="w-3.5 h-3.5 transition-transform duration-200 transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
