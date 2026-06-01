import { getCategoryIcon } from "./category-icons";

function CategoryBentoTile({
  name,
  count,
  onSelect,
}: {
  name: string;
  count: number;
  onSelect: () => void;
}) {
  const Ic = getCategoryIcon(name);

  return (
    <button
      type="button"
      className="rd-card flex items-center gap-3 text-left cursor-pointer px-4 py-3"
      onClick={onSelect}
    >
      <span className="rd-cat-ic">
        <Ic size={15} />
      </span>
      <span className="font-semibold text-sm tracking-[-0.01em]">{name}</span>
      <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px] ml-auto">{count}</span>
    </button>
  );
}

export { CategoryBentoTile };
