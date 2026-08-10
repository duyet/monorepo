import { createFileRoute } from "@tanstack/react-router";
import { GraphViewer } from "../components/GraphViewer";

/**
 * Homepage = Obsidian-style knowledge-graph viewer (Sigma.js + Graphology FA2).
 * Client WebGL canvas: pan/zoom, drag, hover, filters, search, detail panel.
 */
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Knowledge Base | duyet.net" },
      {
        name: "description",
        content:
          "The duyet.net knowledge base as an OKF v0.1 bundle — explore the graph of concepts.",
      },
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
