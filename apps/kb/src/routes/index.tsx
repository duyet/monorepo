import { createFileRoute } from "@tanstack/react-router";
import { GraphViewer } from "../components/GraphViewer";

/**
 * Homepage = Obsidian-style knowledge-graph viewer (Sigma.js + Graphology FA2).
 * Client-only WebGL canvas: pan/zoom, drag nodes, hover neighbors, type filters,
 * search, click-to-read panel. Content from articles + memory notes.
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
    <main className="w-full">
      <GraphViewer />
    </main>
  );
}
