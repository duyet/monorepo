import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 font-serif text-6xl font-bold text-neutral-900 dark:text-neutral-100">
          404
        </h1>
        <h2 className="mb-4 text-xl font-semibold text-neutral-700 dark:text-neutral-300">
          Photo not found
        </h2>
        <p className="mb-8 text-neutral-600 dark:text-neutral-400">
          Sorry, we couldn't find the photo you're looking for.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-terracotta px-6 py-2 font-medium text-white hover:bg-terracotta-medium transition-colors"
        >
          Back to gallery
        </Link>
      </div>
    </div>
  );
}
