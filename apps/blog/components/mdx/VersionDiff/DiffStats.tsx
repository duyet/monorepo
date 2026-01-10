// Added/removed line statistics component
interface DiffStatsProps {
  diffLines: Array<{ type: string }>;
}

export function DiffStats({ diffLines }: DiffStatsProps) {
  if (diffLines.length === 0) return null;

  const addedCount = diffLines.filter((l) => l.type === "added").length;
  const removedCount = diffLines.filter((l) => l.type === "removed").length;
  const contextCount = diffLines.filter((l) => l.type === "context").length;

  return (
    <div className="flex gap-4 text-xs text-neutral-600 dark:text-neutral-400">
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
        {addedCount} added
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
        {removedCount} removed
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full" />
        {contextCount} context
      </span>
    </div>
  );
}
