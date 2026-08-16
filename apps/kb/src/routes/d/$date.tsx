import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { ReactElement } from "react";
import { extractLocalGraph, LocalGraph } from "../../components/LocalGraph";
import { getInboxBySlug } from "../../../lib/content";
import { buildKbGraph } from "../../../lib/graph";
import { markdownToHtml } from "../../../lib/markdown";

export const Route = createFileRoute("/d/$date")({
  loader: async ({ params }) => {
    const note = getInboxBySlug(params.date);
    if (!note) throw notFound();
    const html = await markdownToHtml(note.raw);
    const localGraph = extractLocalGraph(buildKbGraph(), note.slug, 2);
    return { note, html, localGraph };
  },
  head: ({ loaderData }) => {
    const note = loaderData?.note;
    return {
      meta: [
        {
          title: note
            ? `${note.title} | Daily | Knowledge Base | duyet.net`
            : "Daily Note | Knowledge Base | duyet.net",
        },
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
