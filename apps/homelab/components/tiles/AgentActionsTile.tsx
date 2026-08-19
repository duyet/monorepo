import { Badge } from "@duyet/components/ui/badge";
import {
  Activity,
  ArrowUpCircle,
  Check,
  FileText,
  LoaderCircle,
  RefreshCw,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { useAgentActions } from "@/hooks/useDashboard";
import type { AgentAction } from "@/lib/data/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TYPE_ICON: Record<AgentAction["type"], typeof Activity> = {
  "health-check": Activity,
  "auto-restart": RefreshCw,
  "log-collection": FileText,
  "version-upgrade": ArrowUpCircle,
  "security-fix": Shield,
  "config-update": Settings,
};

function StatusSymbol({ status }: { status: AgentAction["status"] }) {
  if (status === "success") {
    return <Check className="size-3 text-[var(--rd-ok)]" aria-label="success" />;
  }
  if (status === "running") {
    return <LoaderCircle className="size-3 text-[var(--rd-accent)]" aria-label="running" />;
  }
  return <X className="size-3 text-destructive" aria-label="failed" />;
}

export function AgentActionsTile() {
  const actions = useAgentActions();
  const latest = actions.slice(0, 8);

  return (
    <Card className="min-w-0">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>duyetbot-agent</CardTitle>
        <Badge variant="secondary" className="gap-1.5 font-mono text-[11px] font-normal">
          <span className="size-1.5 rounded-full bg-[var(--rd-ok)]" />
          active
        </Badge>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {latest.map((action) => {
            const Icon = TYPE_ICON[action.type];
            return (
              <li
                key={action.id}
                className="flex min-w-0 items-center gap-2 py-2 first:pt-0 last:pb-0"
              >
                <span className="w-12 shrink-0 font-mono text-[10px] text-muted-foreground">
                  {action.timestamp}
                </span>
                <Icon size={13} className="shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {action.description}
                </span>
                <StatusSymbol status={action.status} />
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
