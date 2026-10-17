import { ogMeta } from "@duyet/config/og";
import { createFileRoute } from "@tanstack/react-router";
import { SITE_OG_IMAGE, SITE_TITLE, SITE_URL } from "../../lib/site";
import { GraphViewer } from "../components/GraphViewer";

/**
 * Homepage = Obsidian-style knowledge-graph viewer (Sigma.js + Graphology FA2).
 * Client WebGL canvas: pan/zoom, drag, hover, filters, search, detail panel.
 */
const INDEX_TITLE = "Knowledge Base";
const INDEX_DESCRIPTION =
  "The duyet.net knowledge base as an OKF v0.1 bundle — explore the graph of concepts.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE_TITLE} | duyet.net` },
      { name: "description", content: INDEX_DESCRIPTION },
      ...ogMeta({
        url: SITE_URL,
        title: INDEX_TITLE,
        description: INDEX_DESCRIPTION,
        image: SITE_OG_IMAGE,
        imageAlt: `${INDEX_TITLE} — duyet.net`,
      }),
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  return (
    <main className="w-full min-h-[calc(100dvh-3.5rem)]">
      <GraphViewer />
    </main>
  );
}
