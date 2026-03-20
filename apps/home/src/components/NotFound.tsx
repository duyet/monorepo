import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 font-serif text-8xl font-bold text-neutral-900 dark:text-neutral-100">
          404
        </h1>
        <h2 className="mb-4 text-xl font-semibold text-neutral-700 dark:text-neutral-300">
          Page not found
        </h2>
        <p className="mb-8 text-neutral-600 dark:text-neutral-400">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Link
          to="/"
          className="inline-block rounded-lg bg-terracotta px-6 py-2 font-medium text-white hover:bg-terracotta-medium transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
