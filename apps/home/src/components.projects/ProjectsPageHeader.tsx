export function ProjectsPageHeader({ count }: { count: number }) {
  return (
    <header className="max-w-3xl">
      <div className="flex items-baseline gap-4">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Projects
        </h1>
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {count}
        </span>
      </div>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        Products, tools, and open source — most of it live on a subdomain or a
        GitHub repo.
      </p>
    </header>
  );
}
