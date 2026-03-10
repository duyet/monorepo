import Link from "next/link";

export default function NotFound() {
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
          404
        </h1>
        <h2
          className="mb-4 text-xl font-semibold"
          style={{ color: "var(--text-muted)" }}
        >
          Page not found
        </h2>
        <p className="mb-8 text-sm" style={{ color: "var(--text-muted)" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-lg px-6 py-2 font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Go to timeline
          </Link>
          <Link
            href="https://duyet.net"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border px-6 py-2 font-medium transition-colors hover:opacity-80"
            style={{
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            duyet.net
          </Link>
        </div>
      </div>
    </div>
  );
}
