import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
        <h2 className="mb-4 text-xl font-semibold text-muted-foreground">
          Page not found
        </h2>
        <p className="mb-8 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Go to homelab
          </Link>
          <Link
            href="https://duyet.net"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-6 py-2 font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            duyet.net
          </Link>
        </div>
      </div>
    </div>
  );
}
