import { Activity } from "lucide-react";
import type { Service } from "@/lib/data/types";

function ServicesTile({
  allServices,
  runningServices,
  totalServices,
  namespaceCount,
}: {
  allServices: Service[];
  runningServices: number;
  totalServices: number;
  namespaceCount: number;
}) {
  return (
    <div className="rd-card p-[clamp(18px,2.2vw,26px)] col-span-12">
      <div className="flex items-center justify-between mb-[14px]">
        <span className="rd-eyebrow">
          <Activity size={13} />
          Running services
        </span>
        <span className="rd-chip font-[var(--font-mono)] text-[11px]">
          {runningServices}/{totalServices}
        </span>
      </div>

      <div
        className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2"
      >
        {allServices.map((svc) => (
          <div
            key={`${svc.name}-${svc.node}`}
            className="rd-card px-[15px] py-[13px]"
          >
            <div className="flex items-center gap-[7px] mb-2">
              <span className="rd-dot rd-ok" />
              <span className="font-[var(--font-mono)] font-semibold text-[13px] truncate">
                {svc.name}
              </span>
            </div>
            <div className="flex flex-wrap gap-[6px] mb-2">
              <span className="rd-chip font-[var(--font-mono)] text-[10px]">{svc.namespace}</span>
              <span className="rd-chip font-[var(--font-mono)] text-[10px]">:{svc.port}</span>
            </div>
            <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px] mb-[6px]">
              {svc.node}
            </div>
            <div className="flex justify-between text-[11.5px]">
              <span className="font-[var(--font-mono)] text-[var(--rd-text-3)]">
                CPU <span className="text-[var(--rd-text)] font-semibold">{svc.cpu}%</span>
              </span>
              <span className="font-[var(--font-mono)] text-[var(--rd-text-3)]">{svc.memory} MB</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { ServicesTile };
