import { ogMeta } from "@duyet/config/og";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { ReactElement } from "react";
import { getInboxBySlug, resolveWikilinkHref } from "../../../lib/content";
import { buildKbGraph } from "../../../lib/graph";
import { markdownToHtml, preprocessObsidian } from "../../../lib/markdown";
import { SITE_OG_IMAGE, siteUrl } from "../../../lib/site";
import { extractLocalGraph, LocalGraph } from "../../components/LocalGraph";

export const Route = createFileRoute("/d/$date")({
  loader: async ({ params }) => {
    const note = getInboxBySlug(params.date);
    if (!note) throw notFound();
    const html = await markdownToHtml(
      preprocessObsidian(note.raw, resolveWikilinkHref)
    );
    const localGraph = extractLocalGraph(buildKbGraph(), note.slug, 2);
    return { note, html, localGraph };
  },
  head: ({ loaderData, params }) => {
    const note = loaderData?.note;
    // Inbox notes carry no summary field, so the description is derived from the
    // date they are filed under rather than invented copy.
    const title = note ? note.title || note.date : "Daily Note";
    return {
      meta: [
        {
          // `title` is derived above, so the document title and og:title agree
          // even when an inbox note has no heading.
          title: note
            ? `${title} | Daily | Knowledge Base | duyet.net`
            : "Daily Note | Knowledge Base | duyet.net",
        },
        // Overrides the root's og:* tags; the card itself is shared, so only
        // the identity tags change.
        ...ogMeta({
          url: siteUrl(`/d/${params.date}`),
          title,
          description: `Daily inbox note for ${note?.date ?? params.date} on the duyet.net knowledge base.`,
          image: SITE_OG_IMAGE,
          type: "article",
          imageAlt: title,
        }),
      ],
    };
  },
  component: DailyNotePage,
});

function DailyNotePage(): ReactElement {
  const { note, html, localGraph } = Route.useLoaderData();
  const hasSidebar = localGraph.nodes.length > 1;

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-10">
        {/* Main content */}
        <article>
          {/* Breadcrumb */}
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
            <Link to="/" className="hover:text-foreground transition-colors">
              KB
            </Link>{" "}
            /{" "}
            <Link to="/d" className="hover:text-foreground transition-colors">
              Daily
            </Link>{" "}
            / {note.date}
          </p>

          {/* Header */}
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            {note.title || note.date}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mb-8 text-xs text-muted-foreground">
            <a
              href={`/d/${note.slug}.md`}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              raw .md
              <ExternalLink className="size-3" />
            </a>
          </div>

          {/* Rendered markdown */}
          <div
            className="typeset typeset-kb max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <div className="mt-8 pt-6 border-t border-border">
            <Link
              to="/d"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Back to Daily
            </Link>
          </div>
        </article>

        {/* Sidebar — local graph */}
        {hasSidebar && (
          <aside className="space-y-6">
            <LocalGraph
              nodes={localGraph.nodes}
              edges={localGraph.edges}
              currentId={note.slug}
            />
          </aside>
        )}
      </div>
    </main>
  );
}
