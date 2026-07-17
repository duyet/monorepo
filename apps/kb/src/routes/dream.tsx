import { createFileRoute } from "@tanstack/react-router";
import { getDreamContent } from "../../lib/content";
import { markdownToHtml } from "../../lib/markdown";

export const Route = createFileRoute("/dream")({
  loader: async () => {
    const { raw, lastDream } = getDreamContent();
    const html = await markdownToHtml(raw);
    return { html, lastDream };
  },
  head: () => ({
    meta: [{ title: "Dream — Knowledge Base | duyet.net" }],
  }),
  component: DreamPage,
});

function DreamPage() {
  const { html, lastDream } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
          Knowledge Base
        </p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dream</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Memory consolidation protocol — the maintenance pass that keeps the KB
          compact and retrievable.
        </p>
        {lastDream && (
          <p className="mt-3 text-xs font-mono text-muted-foreground border border-border rounded px-3 py-1.5 inline-block">
            Last dream: {lastDream}
          </p>
        )}
      </div>

      <div
        className="typeset typeset-kb max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
