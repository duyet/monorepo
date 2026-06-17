function CatChip({
  name,
  count,
  active,
  onClick,
}: {
  name: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`shrink-0 cursor-pointer whitespace-nowrap bg-transparent px-0 text-[14px] tracking-tight transition-colors ${
        active
          ? "font-semibold text-[var(--rd-text)]"
          : "font-normal text-[var(--rd-text-3)] hover:text-[var(--rd-text)]"
      }`}
      onClick={onClick}
    >
      {name}
      {count != null && (
        <span className="ml-[3px] text-[var(--rd-text-4)]">{count}</span>
      )}
    </button>
  );
}

export { CatChip };
