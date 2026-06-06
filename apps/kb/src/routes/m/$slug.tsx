import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Tag } from "lucide-react";
import { getMemoryBySlug, getLinkedArticles } from "../../../lib/content";
import { markdownToHtml } from "../../../lib/markdown";

export const Route = createFileRoute("/m/$slug")({
  loader: async ({ params }) => {
    const note = getMemoryBySlug(params.slug);
    if (!note) throw notFound();
    const html = await markdownToHtml(note.raw);
    const linked = getLinkedArticles(params.slug);
    return { note, html, linked };
  },
  head: ({ loaderData }) => {
    const note = loaderData?.note;
    return {
      meta: [
        {
          title: note
            ? `${note.title} | Memory | Knowledge Base | duyet.net`
            : "Memory Note | Knowledge Base | duyet.net",
        },
        ...(note?.description
          ? [{ name: "description", content: note.description }]
          : []),
      ],
    };
  },
  component: MemoryNotePage,
});

function MemoryNotePage() {
  const { note, html, linked } = Route.useLoaderData();
  const hasLinks = linked.outgoing.length > 0 || linked.incoming.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-10">
        {/* Main content */}
        <article>
          {/* Breadcrumb */}
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
            <Link to="/" className="hover:text-foreground transition-colors">
              KB
            </Link>{" "}
            /{" "}
            <Link
              to="/m"
              className="hover:text-foreground transition-colors"
            >
              Memory
            </Link>{" "}
            / {note.slug}
          </p>

          {/* Header */}
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            {note.title}
          </h1>
          {note.description && (
            <p className="text-muted-foreground leading-relaxed mb-4">
              {note.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 mb-8 text-xs text-muted-foreground">
            <span className="border border-primary/30 rounded px-1.5 py-0.5 text-primary capitalize">
              {note.memoryType}
            </span>
            {note.updated && <span>Updated {note.updated}</span>}
            {note.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="size-3" />
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-border rounded px-1.5 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <a
              href={`/m/${note.slug}.md`}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              raw .md
              <ExternalLink className="size-3" />
            </a>
          </div>

          {/* Rendered markdown */}
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* Sources */}
          {note.sources.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Sources
              </p>
              <ul className="space-y-1">
                {note.sources.map((src) => (
                  <li key={src}>
                    <a
                      href={src}
                      className="text-xs text-primary hover:underline underline-offset-4 break-all"
                    >
                      {src}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border">
            <Link
              to="/m"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Back to Memory
            </Link>
          </div>
        </article>

        {/* Sidebar — linked content */}
        {hasLinks && (
          <aside className="space-y-6">
            {linked.outgoing.length > 0 && (
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  Related
                </p>
                <ul className="space-y-2">
                  {linked.outgoing.map((item) => (
                    <li key={item.slug}>
                      <Link
                        to={
                          "memoryType" in item
                            ? "/m/$slug"
                            : "/k/$slug"
                        }
                        params={{ slug: item.slug }}
                        className="text-sm hover:underline underline-offset-4 block"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {linked.incoming.length > 0 && (
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  Referenced by
                </p>
                <ul className="space-y-2">
                  {linked.incoming.map((item) => (
                    <li key={item.slug}>
                      <Link
                        to={
                          "memoryType" in item
                            ? "/m/$slug"
                            : "/k/$slug"
                        }
                        params={{ slug: item.slug }}
                        className="text-sm hover:underline underline-offset-4 block"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
