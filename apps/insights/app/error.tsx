"use client";

import Container from "@duyet/components/Container";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="py-12">
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="mb-4 font-serif text-5xl font-bold text-neutral-900 dark:text-neutral-100">
            Oops!
          </h1>
          <h2 className="mb-4 text-xl font-semibold text-neutral-700 dark:text-neutral-300">
            Something went wrong
          </h2>
          <p className="mb-8 text-neutral-600 dark:text-neutral-400">
            {error.message ||
              "An unexpected error occurred while loading the data."}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={reset}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
            <a
              href="/"
              className="rounded-lg border border-neutral-300 px-6 py-2 font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            >
              Back to dashboard
            </a>
          </div>
        </div>
      </div>
    </Container>
  );
}
