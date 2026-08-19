import { Badge } from "@duyet/components/ui/badge";
import { ScrollArea } from "@duyet/components/ui/scroll-area";
import { useServices } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ServicesTile() {
  const {
    namespaces,
    servicesByNamespace,
    runningServices,
    totalServices,
  } = useServices();

  return (
    <Card className="min-w-0">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Services</CardTitle>
        <Badge variant="secondary" className="font-mono text-[11px] font-normal">
          {runningServices}/{totalServices} running
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px] pr-2">
          <div className="space-y-3">
            {namespaces.map((ns) => (
              <div key={ns}>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {ns}
                </p>
                <ul className="divide-y divide-border">
                  {(servicesByNamespace[ns] ?? []).map((svc) => (
                    <li
                      key={`${svc.name}-${svc.port}-${svc.node}`}
                      className={`flex min-w-0 items-center gap-2 py-1.5 text-xs ${
                        svc.status !== "running" ? "opacity-40" : ""
                      }`}
                    >
                      <span
                        className={`size-1.5 shrink-0 rounded-full ${
                          svc.status === "running"
                            ? "bg-[var(--rd-ok)]"
                            : "bg-destructive"
                        }`}
                      />
                      <span className="min-w-0 flex-1 truncate font-mono">
                        {svc.name}
                      </span>
                      <span className="hidden shrink-0 font-mono text-[10px] text-muted-foreground sm:inline">
                        {svc.node}
                      </span>
                      <span className="w-10 shrink-0 text-right font-mono text-[10px] text-muted-foreground tabular-nums">
                        {svc.cpu}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
