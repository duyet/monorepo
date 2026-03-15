import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[#fbf7f0] dark:bg-[#1f1f1f]">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-6xl font-bold font-[family-name:var(--font-display)] text-neutral-900 dark:text-neutral-100">
          404
        </h1>
        <h2 className="mb-4 text-xl font-semibold text-neutral-500 dark:text-neutral-400">
          Page not found
        </h2>
        <p className="mb-8 text-sm text-neutral-500 dark:text-neutral-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-xl px-6 py-2 font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Go to timeline
          </Link>
          <Link
            href="https://duyet.net"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-neutral-200 dark:border-white/10 px-6 py-2 font-medium transition-colors hover:opacity-80 text-neutral-900 dark:text-neutral-100"
          >
            duyet.net
          </Link>
        </div>
      </div>
    </div>
  );
}
