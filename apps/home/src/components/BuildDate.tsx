const today = new Date().toISOString().split("T")[0];

export function BuildDate() {
  return (
    <div className="inline-flex rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-mono text-neutral-500 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
      Updated {today}
    </div>
  );
}
