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
        <div className="mt-10 border-t pt-6 text-xs text-muted-foreground">
          <p className="mb-2 font-mono uppercase tracking-widest">
            For agents &amp; crawlers
          </p>
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {[
              { href: "/llms.txt", label: "/llms.txt" },
              { href: "/sitemap.xml", label: "/sitemap.xml" },
              {
                href: "/.well-known/api-catalog",
                label: "/.well-known/api-catalog",
              },
              { href: "/developers", label: "/developers" },
            ].map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
