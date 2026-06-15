import { createFileRoute } from "@tanstack/react-router";
import { GraphViewer } from "../components/GraphViewer";

/**
 * Homepage = the knowledge-graph viewer (native, no iframe).
 *
 * The viewer mounts client-side (cytoscape is DOM-bound) and renders the full
 * bundle — articles + memory notes — as a 2D graph with a click-to-read detail
 * panel. Same UX as the standalone /viz.html, but built from the app's content
 * loader so it shares the site shell. The root layout wraps this in the site
 * header/footer, so navigation is preserved.
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
