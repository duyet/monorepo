import { distanceToNow } from "@duyet/libs/date";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { getShortforms } from "@/lib/shortforms";
import type { Shortform } from "@/lib/shortforms";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Quick Notes | Tôi là Duyệt" },
      { name: "description", content: "Short-form thoughts and updates." },
    ],
  }),
  loader: () => {
    const shortforms = getShortforms();
    return { shortforms };
  },
  component: NotesPage,
});

function NotesPage(): ReactElement {
  const { shortforms } = Route.useLoaderData() as { shortforms: Shortform[] };

  return (
    <div>
      <header className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          NOTES
        </p>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
          Quick Notes
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Short-form thoughts and updates.
        </p>
      </header>

      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 pb-16 border-t pt-12">
        {shortforms.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">
            No notes yet.
          </p>
        ) : (
          <ul className="max-w-3xl space-y-10">
            {shortforms.map((note) => (
              <li key={note.id}>
                <Link
                  to="/notes/$id/"
                  params={{ id: note.id }}
                  className="flex items-start gap-4 group"
                >
                  <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    DL
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Duyet Le</span>
                      <span className="text-muted-foreground">
                        {distanceToNow(note.date)}
                      </span>
                    </div>
                    <p className="mt-2 text-base leading-relaxed group-hover:text-muted-foreground transition-colors line-clamp-3">
                      {note.body}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
