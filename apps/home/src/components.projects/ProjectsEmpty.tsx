export function ProjectsEmpty({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <div className="border-y py-12 text-center">
      <p className="text-sm text-muted-foreground">
        No projects found matching &ldquo;{query}&rdquo;
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-3 cursor-pointer border-none bg-transparent text-[13px] text-foreground underline"
      >
        Clear search
      </button>
    </div>
  );
}
