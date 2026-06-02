export function CategoryHeader({ category, count }: { category: string; count: number }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h2 className="m-0 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {category}
      </h2>
      <span className="text-[11px] text-muted-foreground">{count}</span>
    </div>
  );
}
