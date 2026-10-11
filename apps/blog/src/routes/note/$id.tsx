import { dateFormat } from "@duyet/libs/date";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { type ReactElement, Suspense } from "react";
import { Markdown } from "@/components/Markdown";
import { buildArticleHead } from "@/lib/head";
import { MarkdownMenuWrapper } from "@/src/routes/$year/$month/-markdown-menu-wrapper";
import { ogAbsolute, ogNoteCardPath } from "@/lib/og";
import { getShortformById, getShortforms } from "@/lib/shortforms";
import type { Shortform } from "@/lib/shortforms";

const SITE_URL = "https://blog.duyet.net";

type NeighborNote = { id: string; title?: string; excerpt: string };

interface NoteData {
  note: Shortform;
  newer: NeighborNote | null;
  older: NeighborNote | null;
}

export const Route = createFileRoute("/note/$id")({
  head: ({ params, loaderData }) => {
    const note = (loaderData as NoteData | undefined)?.note;
    const id = (params.id ?? "").replace(/\.(md|html)$/, "");
    const title = note?.title ?? (id ? id.replace(/-/g, " ") : "Note");
    const canonical = `${SITE_URL}/note/${id}`;
    // Notes are shortform, so the card is type-only (notes carry no thumbnail)
    // and lives at /og/note-<id>.png — see scripts/generate-og.ts. The raw
    // note is written to public/note/{id}.md by generate-static-files.ts.
    return buildArticleHead({
      title,
      description: note?.excerpt ?? "",
      url: canonical,
      image: ogAbsolute(ogNoteCardPath(id)),
      titleSuffix: " | Quick Notes",
      markdownHref: `${canonical}.md`,
      datePublished: note?.date,
    });
  },
  loader: ({ params }) => {
    const note = getShortformById(params.id);
    if (!note) throw notFound();
    const all = getShortforms();
    const idx = all.findIndex((n) => n.id === note.id);
    const toNeighbor = (n: Shortform): NeighborNote => ({
      id: n.id,
      title: n.title,
      excerpt: n.excerpt,
    });
    // `all` is sorted newest-first, so idx-1 is the newer note, idx+1 the older.
    const newer = idx > 0 ? toNeighbor(all[idx - 1]) : null;
    const older =
      idx >= 0 && idx < all.length - 1 ? toNeighbor(all[idx + 1]) : null;
    return { note, newer, older } satisfies NoteData;
  },
  component: NotePage,
});

function NeighborCard({
  note,
  direction,
}: {
  note: NeighborNote;
  direction: "newer" | "older";
}): ReactElement {
  const older = direction === "older";
  return (
    <Link
      to="/note/$id/"
      params={{ id: note.id }}
      className={`group flex flex-col gap-1.5 rounded-[var(--rd-r)] border p-4 no-underline transition-colors hover:bg-[var(--rd-surface-2)] ${older ? "sm:items-end sm:text-right" : ""}`}
    >
      <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--rd-text-3)]">
        {older ? "Older →" : "← Newer"}
      </span>
      <span className="line-clamp-2 text-[0.95rem] font-[560] leading-snug tracking-[-0.01em] text-[var(--rd-text)] transition-colors group-hover:text-[var(--rd-accent-ink)]">
        {note.title || note.excerpt}
      </span>
    </Link>
  );
}

function NotePage(): ReactElement {
  const { note, newer, older } = Route.useLoaderData() as NoteData;

  return (
    <article className="post-reader post-reader--note mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/notes/"
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
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          {note.hackerNews ? (
            <a
              href={note.hackerNews}
              target="_blank"
              rel="noopener noreferrer"
              className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[12.5px] underline underline-offset-4 decoration-[var(--rd-border)] hover:text-[var(--rd-text-1)] transition-colors"
            >
              Comment on HN ↗
            </a>
          ) : null}
          {note.x ? (
            <a
              href={note.x}
              target="_blank"
              rel="noopener noreferrer"
              className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[12.5px] underline underline-offset-4 decoration-[var(--rd-border)] hover:text-[var(--rd-text-1)] transition-colors"
            >
              Comment on X ↗
            </a>
          ) : null}
          <MarkdownMenuWrapper
            markdownUrl={`/note/${note.id}.md`}
            markdownContent={note.body}
            dropUp={false}
          />
        </div>
        {note.title ? (
          <h1 className="mt-8 text-2xl font-bold tracking-tight">
            {note.title}
          </h1>
        ) : null}
        <Suspense
          fallback={
            <p className="mt-6 text-lg leading-relaxed whitespace-pre-wrap">
              {note.body}
            </p>
          }
        >
          <Markdown source={note.body} className="mt-6" />
        </Suspense>
      </div>
      <div className="mx-auto max-w-3xl">
        {newer || older ? (
          <nav className="mt-16 grid gap-3 pt-8 sm:grid-cols-2">
            {newer ? (
              <NeighborCard note={newer} direction="newer" />
            ) : (
              <span className="hidden sm:block" />
            )}
            {older ? <NeighborCard note={older} direction="older" /> : null}
          </nav>
        ) : null}
      </div>
    </article>
  );
}
