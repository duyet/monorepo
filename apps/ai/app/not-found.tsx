import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-6xl font-bold text-foreground">
          404
        </h1>
        <h2 className="mb-4 text-xl font-semibold text-foreground/70">
          Page not found
        </h2>
        <p className="mb-8 text-foreground/60">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-lg bg-foreground px-6 py-2 font-medium text-background hover:bg-foreground/90 transition-colors"
          >
            Go to chat
          </Link>
          <Link
            href="https://duyet.net"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-foreground/20 px-6 py-2 font-medium text-foreground hover:bg-foreground/5 transition-colors"
          >
            duyet.net
          </Link>
        </div>
      </div>
    </div>
  );
}
