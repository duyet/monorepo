"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-md text-center">
        <h1
          className="mb-4 text-6xl font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text)",
          }}
        >
          Oops!
        </h1>
        <h2
          className="mb-4 text-xl font-semibold"
          style={{ color: "var(--text-muted)" }}
        >
          Something went wrong
        </h2>
        <p className="mb-8 text-sm" style={{ color: "var(--text-muted)" }}>
          {error.message || "An unexpected error occurred"}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg px-6 py-2 font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border px-6 py-2 font-medium transition-colors hover:opacity-80"
            style={{
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
