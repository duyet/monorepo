import {
  Activity,
  ArrowUpCircle,
  FileText,
  RefreshCw,
  Settings,
  Shield,
} from "lucide-react";
import { useAgentActions } from "@/hooks/useDashboard";
import type { AgentAction } from "@/lib/data/types";

const TYPE_ICON: Record<AgentAction["type"], typeof Activity> = {
  "health-check": Activity,
  "auto-restart": RefreshCw,
  "log-collection": FileText,
  "version-upgrade": ArrowUpCircle,
  "security-fix": Shield,
  "config-update": Settings,
};

function StatusSymbol({ status }: { status: AgentAction["status"] }) {
  switch (status) {
    case "success":
      return (
        <span
          className="font-[var(--font-mono)] text-[12px] font-bold"
          style={{ color: "var(--rd-ok)" }}
        >
          &#x2713;
        </span>
      );
    case "running":
      return (
        <span
          className="font-[var(--font-mono)] text-[12px] font-bold"
          style={{ color: "var(--rd-accent)" }}
        >
          &#x21BB;
        </span>
      );
    case "failed":
      return (
        <span
          className="font-[var(--font-mono)] text-[12px] font-bold"
          style={{ color: "var(--rd-down)" }}
        >
          &#x2717;
        </span>
      );
  }
}

export function AgentActionsTile() {
  const actions = useAgentActions();
  const latest = actions.slice(0, 10);

  return (
    <div className="rd-card md:col-span-2 overflow-hidden">
      <div className="flex items-center justify-between px-[clamp(14px,1.8vw,22px)] pt-[clamp(14px,1.8vw,22px)] pb-3">
        <span className="rd-eyebrow">duyetbot-agent</span>
        <span className="rd-chip font-[var(--font-mono)] text-[11px] inline-flex items-center gap-1.5">
          <span
            className="inline-block w-[7px] h-[7px] rounded-full rd-pulse"
            style={{ background: "var(--rd-ok)" }}
          />
          active
        </span>
      </div>

      <div className="rd-termblock px-[clamp(14px,1.8vw,22px)] py-2">
        {latest.map((action, i) => {
          const Icon = TYPE_ICON[action.type];
          const isLast = i === latest.length - 1;

          return (
            <div
              key={action.id}
              className={`flex items-center gap-3 py-2 ${
                isLast ? "" : "border-b border-[var(--rd-line)]"
              }`}
            >
              <span
                className="font-[var(--font-mono)] text-[10px] text-[var(--rd-text-4)] w-[60px] shrink-0"
              >
                {action.timestamp}
              </span>
              <Icon
                size={13}
                className="shrink-0 text-[var(--rd-text-3)]"
              />
              <span className="text-[12px] text-[var(--rd-text-2)] min-w-0 truncate">
                {action.description}
              </span>
              <span className="ml-auto shrink-0">
                <StatusSymbol status={action.status} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
