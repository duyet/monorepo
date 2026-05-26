import { dateFormat } from "@duyet/libs/date";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { getShortformById } from "@/lib/shortforms";

export const Route = createFileRoute("/notes/$id")({
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${(loaderData as { id?: string } | undefined)?.id ?? "Note"} | Quick Notes`,
      },
    ],
  }),
  loader: ({ params }) => {
    const note = getShortformById(params.id);
    if (!note) throw notFound();
    return note;
  },
  component: NotePage,
});

function NotePage(): ReactElement {
  const note = Route.useLoaderData();

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <Link
        to="/notes"
        className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Quick Notes
      </Link>
      <div className="mt-8 flex items-center gap-3">
        <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-semibold">
          DL
        </div>
        <div>
          <p className="text-sm font-medium">Duyet Le</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {dateFormat(note.date, "MMM d, yyyy")}
          </p>
        </div>
      </div>
      <p className="mt-8 text-lg leading-relaxed whitespace-pre-wrap">
        {note.body}
      </p>
    </article>
  );
}
