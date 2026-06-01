import { Layers, AlignJustify } from "lucide-react";
import { cn } from "../lib/utils";

export function ViewToggle({
  view,
  setView,
}: {
  view: "grid" | "list";
  setView: (v: "grid" | "list") => void;
}) {
  const btnBase =
    "inline-flex items-center justify-center w-8 h-8 border rounded-[var(--rd-r-sm)] bg-transparent cursor-pointer";

  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        aria-label="Grid view"
        onClick={() => setView("grid")}
        className={cn(
          btnBase,
          view === "grid"
            ? "border-[var(--rd-text)] text-[var(--rd-text)]"
            : "border-[var(--rd-border)] text-[var(--rd-text-3)]",
        )}
      >
        <Layers size={15} />
      </button>
      <button
        type="button"
        aria-label="List view"
        onClick={() => setView("list")}
        className={cn(
          btnBase,
          view === "list"
            ? "border-[var(--rd-text)] text-[var(--rd-text)]"
            : "border-[var(--rd-border)] text-[var(--rd-text-3)]",
        )}
      >
        <AlignJustify size={15} />
      </button>
    </div>
  );
}
