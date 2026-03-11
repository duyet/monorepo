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
        <h1 className="mb-4 text-6xl font-bold text-foreground">Oops!</h1>
        <h2 className="mb-4 text-xl font-semibold text-foreground/70">
          Something went wrong
        </h2>
        <p className="mb-8 text-foreground/60">
          {error.message || "An unexpected error occurred"}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-foreground px-6 py-2 font-medium text-background hover:bg-foreground/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-foreground/20 px-6 py-2 font-medium text-foreground hover:bg-foreground/5 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
