"use client";

import { useEffect, useRef, useState } from "react";

export function Mermaid({ children }: { children?: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  const code =
    typeof children === "string"
      ? children
      : Array.isArray(children)
        ? children.join("")
        : "";

  useEffect(() => {
    if (!code.trim()) return;

    let cancelled = false;

    import("mermaid").then((mermaid) => {
      if (cancelled) return;

      mermaid.default.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "loose",
      });

      const id = `mermaid-${Math.random().toString(36).slice(2, 10)}`;

      mermaid.default
        .render(id, code.trim())
        .then(({ svg: renderedSvg }) => {
          if (!cancelled) setSvg(renderedSvg);
        })
        .catch((err: Error) => {
          if (!cancelled) setError(err.message);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <pre className="overflow-x-auto rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </pre>
    );
  }

  if (!svg) {
    return (
      <div
        ref={containerRef}
        className="flex items-center justify-center py-8 text-sm text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55"
      >
        Loading diagram...
      </div>
    );
  }

  return (
    <div
      className="my-6 overflow-x-auto [&>svg]:mx-auto [&>svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
