import { AlignJustify, Layers } from "lucide-react";
import { cn } from "../lib/utils";

export function ViewToggle({
  view,
  setView,
}: {
  view: "grid" | "list";
  setView: (v: "grid" | "list") => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-[var(--rd-border)] bg-[var(--rd-surface)] p-1">
      <button
        type="button"
        aria-label="Grid view"
        onClick={() => setView("grid")}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          view === "grid"
            ? "bg-[var(--rd-text)] text-[var(--rd-bg)]"
            : "text-[var(--rd-text-3)] hover:text-[var(--rd-text)]"
        )}
      >
        <Layers size={14} />
      </button>
      <button
        type="button"
        aria-label="List view"
        onClick={() => setView("list")}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          view === "list"
            ? "bg-[var(--rd-text)] text-[var(--rd-bg)]"
            : "text-[var(--rd-text-3)] hover:text-[var(--rd-text)]"
        )}
      >
        <AlignJustify size={14} />
      </button>
    </div>
  );
}
