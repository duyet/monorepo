import { ogMeta } from "@duyet/config/og";
import { createFileRoute } from "@tanstack/react-router";
import { getDreamContent } from "../../lib/content";
import { markdownToHtml } from "../../lib/markdown";
import { SITE_OG_IMAGE, siteUrl } from "../../lib/site";

const DREAM_TITLE = "Dream";
const DREAM_DESCRIPTION =
  "Memory consolidation protocol — the maintenance pass that keeps the duyet.net knowledge base compact and retrievable.";

export const Route = createFileRoute("/dream")({
  loader: async () => {
    const { raw, lastDream } = getDreamContent();
    const html = await markdownToHtml(raw);
    return { html, lastDream };
  },
  head: () => ({
    meta: [
      { title: `${DREAM_TITLE} — Knowledge Base | duyet.net` },
      // The route had no <meta name="description">; OG needs one or the card
      // unfurls bare, so this is added rather than left inherited.
      { name: "description", content: DREAM_DESCRIPTION },
      ...ogMeta({
        url: siteUrl("/dream"),
        title: `${DREAM_TITLE} — Knowledge Base`,
        description: DREAM_DESCRIPTION,
        image: SITE_OG_IMAGE,
        imageAlt: `${DREAM_TITLE} — Knowledge Base`,
      }),
    ],
  }),
  component: DreamPage,
});

function DreamPage() {
  const { html, lastDream } = Route.useLoaderData();

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
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
    </main>
  );
}
