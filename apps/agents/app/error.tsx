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
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <div className="max-w-md text-center">
        <h1
          className="mb-4 text-6xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Oops!
        </h1>
        <h2 className="mb-4 text-xl font-semibold text-muted-foreground">
          Something went wrong
        </h2>
        <p className="mb-8 text-muted-foreground">
          {error.message || "An unexpected error occurred"}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            style={{ borderRadius: "var(--radius)" }}
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-border px-6 py-2 font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            style={{ borderRadius: "var(--radius)" }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
