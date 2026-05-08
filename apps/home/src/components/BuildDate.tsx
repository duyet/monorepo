const today = new Date().toISOString().split("T")[0];

export function BuildDate() {
  return (
    <div className="inline-flex rounded-md border border-[var(--border)] bg-[var(--muted)] px-2 py-1 text-xs font-mono text-[var(--muted-foreground)]">
      Updated {today}
    </div>
  );
}
