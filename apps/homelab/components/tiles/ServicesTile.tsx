import { Activity } from "lucide-react";
import { useServices } from "@/hooks/useDashboard";

export function ServicesTile() {
  const {
    namespaces,
    servicesByNamespace,
    runningServices,
    totalServices,
  } = useServices();

  return (
    <div className="rd-card md:col-span-2 p-[clamp(14px,1.8vw,22px)]">
      <div className="flex items-center justify-between mb-3">
        <span className="rd-eyebrow">
          <Activity size={13} />
          Services
        </span>
        <span className="rd-chip font-[var(--font-mono)] text-[11px]">
          {runningServices}/{totalServices} running
        </span>
      </div>

      <div className="max-h-[340px] overflow-y-auto rd-rows">
        {namespaces.map((ns) => (
          <div key={ns}>
            <div
              className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--rd-text-4)] px-1 pt-3 pb-1"
            >
              {ns}
            </div>
            {(servicesByNamespace[ns] ?? []).map((svc) => (
              <div
                key={`${svc.name}-${svc.port}-${svc.node}`}
                className={`rd-row grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 text-sm ${
                  svc.status !== "running" ? "opacity-40" : ""
                }`}
              >
                <span
                  className={`rd-dot ${
                    svc.status === "running" ? "rd-ok" : "rd-down"
                  }`}
                />
                <span className="font-[var(--font-mono)] text-[13px] truncate text-[var(--rd-text)]">
                  {svc.name}
                </span>
                <span className="rd-chip font-[var(--font-mono)] text-[10px]">
                  {svc.namespace}:{svc.port}
                </span>
                <span className="font-[var(--font-mono)] text-[11px] text-[var(--rd-text-3)]">
                  {svc.node}
                </span>
                <span className="font-[var(--font-mono)] text-[11px] text-[var(--rd-text-3)]">
                  {svc.cpu}%
                </span>
                <span className="font-[var(--font-mono)] text-[11px] text-[var(--rd-text-3)]">
                  {svc.memory}MB
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}