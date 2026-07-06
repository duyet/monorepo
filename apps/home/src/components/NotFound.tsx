import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-6xl font-semibold">404</h1>
        <h2 className="mb-4 text-xl font-semibold text-foreground/85">
          Page not found
        </h2>
        <p className="mb-8 text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Link
          to="/"
          className="inline-block rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
