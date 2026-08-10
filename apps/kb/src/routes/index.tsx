import { createFileRoute } from "@tanstack/react-router";
import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";

/**
 * Homepage = Obsidian-style knowledge-graph viewer (Sigma.js + Graphology FA2).
 * Graph is client-only (WebGL) so SSR emits a visible shell — never a blank page
 * if the module graph fails to hydrate.
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

const GraphViewer = lazy(async () => {
  const m = await import("../components/GraphViewer");
  return { default: m.GraphViewer };
});

function GraphFallback({
  message = "Loading knowledge graph…",
}: {
  message?: string;
}) {
  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-2 border-t border-border bg-[#0a0a0a] text-zinc-400"
      style={{ height: "calc(100dvh - 3.5rem)" }}
    >
      <p className="text-sm font-mono">{message}</p>
      <p className="max-w-md px-4 text-center text-xs text-zinc-600">
        If this never loads, hard-refresh to clear a stale HTML cache (old JS
        hashes return HTML and break ES modules).
      </p>
    </div>
  );
}

class GraphErrorBoundary extends Component<
  { children: ReactNode; onError: (msg: string) => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(err: Error, _info: ErrorInfo) {
    this.props.onError(err.message || "unknown error");
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function ClientGraph() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <GraphFallback />;
  }

  if (error) {
    return <GraphFallback message={`Graph failed: ${error}`} />;
  }

  return (
    <Suspense fallback={<GraphFallback />}>
      <GraphErrorBoundary onError={setError}>
        <GraphViewer />
      </GraphErrorBoundary>
    </Suspense>
  );
}

function IndexPage() {
  return (
    <main className="w-full">
      <ClientGraph />
    </main>
  );
}
