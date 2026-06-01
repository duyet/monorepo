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
      className={`rd-chip rd-chip-btn ${active ? "rd-on" : ""}`}
      onClick={onClick}
    >
      {name}
      {count != null && (
        <span className="opacity-[0.55] ml-[2px]">{count}</span>
      )}
    </button>
  );
}

export { CatChip };
