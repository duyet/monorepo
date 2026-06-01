import { AlertCircle, Clock } from "lucide-react";
import type { ServiceDowntime } from "@/lib/data/types";

function IncidentsTile({ downtimeHistory }: { downtimeHistory: ServiceDowntime[] }) {
  return (
    <div className="rd-card p-[clamp(18px,2.2vw,26px)] col-span-12">
      <div className="flex items-center justify-between mb-[14px]">
        <span className="rd-eyebrow">
          <AlertCircle size={13} />
          Recent incidents
        </span>
        <span className="rd-chip font-[var(--font-mono)] text-[11px]">
          {downtimeHistory.length} logged
        </span>
      </div>
      {downtimeHistory.length === 0 ? (
        <p className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[12.5px]">
          No incidents in the last 30 days.
        </p>
      ) : (
        <div className="rd-rows">
          {downtimeHistory.map((inc, i) => (
            <div
              key={i}
              className="rd-row grid-cols-[auto_1fr_auto] px-1 py-[14px]"
            >
              <AlertCircle size={15} style={{ color: "var(--rd-warn)" }} />
              <div>
                <div>
                  <span className="font-[var(--font-mono)] font-semibold text-[13px]">{inc.service}</span>
                  <span className="text-[var(--rd-text-2)] ml-2 text-[12.5px]">— {inc.reason}</span>
                </div>
                <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px] mt-[3px]">{inc.start}</div>
              </div>
              <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs flex items-center gap-1">
                <Clock size={12} />
                {inc.duration}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { IncidentsTile };
