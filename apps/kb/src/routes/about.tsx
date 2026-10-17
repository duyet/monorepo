import { ogMeta } from "@duyet/config/og";
import { createFileRoute } from "@tanstack/react-router";
import { getReadmeContent } from "../../lib/content";
import { markdownToHtml } from "../../lib/markdown";
import { SITE_OG_IMAGE, siteUrl } from "../../lib/site";

const ABOUT_TITLE = "About";
const ABOUT_DESCRIPTION =
  "How this knowledge base is built — the shared-brain protocol behind kb.duyet.net.";

export const Route = createFileRoute("/about")({
  loader: async () => {
    const html = await markdownToHtml(getReadmeContent());
    return { html };
  },
  head: () => ({
    meta: [
      { title: `${ABOUT_TITLE} — Knowledge Base | duyet.net` },
      { name: "description", content: ABOUT_DESCRIPTION },
      ...ogMeta({
        url: siteUrl("/about"),
        title: `${ABOUT_TITLE} — Knowledge Base`,
        description: ABOUT_DESCRIPTION,
        image: SITE_OG_IMAGE,
        imageAlt: `${ABOUT_TITLE} — Knowledge Base`,
      }),
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { html } = Route.useLoaderData();

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
          Knowledge Base
        </p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">About</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          How this site is built — rendered from the README of{" "}
          <a
            href="https://github.com/duyet/kb"
            className="underline hover:text-foreground"
          >
            duyet/kb
          </a>
          , the shared-brain repository powering this knowledge base.
        </p>
      </div>

      <div
        className="typeset typeset-kb max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
