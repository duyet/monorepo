import { Layers } from "lucide-react";

function NodeTypeTile({
  typeCounts,
  typeLabels,
}: {
  typeCounts: Record<string, number>;
  typeLabels: Record<string, string>;
}) {
  return (
    <div className="rd-card p-[clamp(18px,2.2vw,26px)] col-span-12">
      <div className="flex items-center justify-between mb-[14px]">
        <span className="rd-eyebrow">
          <Layers size={13} />
          Node types
        </span>
      </div>
      <div className="flex flex-wrap gap-[10px]">
        {Object.entries(typeCounts).map(([type, count]) => (
          <div
            key={type}
            className="rd-card flex flex-col gap-1 min-w-[90px] px-4 py-3"
          >
            <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px]">{typeLabels[type] ?? type}</div>
            <div className="text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none text-[1.5rem]">
              {count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { NodeTypeTile };
