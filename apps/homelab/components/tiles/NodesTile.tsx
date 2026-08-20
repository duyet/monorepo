import { Badge } from "@duyet/components/ui/badge";
import { Progress } from "@duyet/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@duyet/components/ui/table";
import { useClusterInfo, useNodes } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusDot } from "./StatusDot";

function NodesTile() {
  const { nodes, onlineCount, totalNodes } = useNodes();
  const clusterInfo = useClusterInfo();

  return (
    <Card className="min-w-0">
      <CardHeader className="flex-row items-baseline justify-between">
        <CardTitle className="text-base font-semibold">Nodes</CardTitle>
        <span className="font-mono text-[12px] text-[var(--rd-text-3)]">
          <strong className="font-semibold text-[var(--rd-accent)]">
            {onlineCount}/{totalNodes}
          </strong>{" "}
          online
        </span>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8 px-2 text-[11px]">Name</TableHead>
              <TableHead className="h-8 px-2 text-[11px]">Role</TableHead>
              <TableHead className="h-8 px-2 text-[11px]">CPU</TableHead>
              <TableHead className="h-8 px-2 text-[11px]">RAM</TableHead>
              <TableHead className="hidden h-8 px-2 text-[11px] sm:table-cell">
                Uptime
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nodes.map((node) => {
              const offline = node.status !== "online";
              const role = clusterInfo.nodeRoles[node.name] ?? "worker";
              return (
                <TableRow
                  key={node.id}
                  className={offline ? "opacity-50" : undefined}
                >
                  <TableCell className="px-2 py-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <StatusDot status={node.status} />
                      <div className="min-w-0">
                        <p className="truncate font-mono text-xs font-medium">
                          {node.name}
                        </p>
                        <p className="truncate font-mono text-[10px] text-muted-foreground">
                          {node.ip}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-2">
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] font-normal"
                    >
                      {role}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[88px] px-2 py-2">
                    <p className="mb-1 font-mono text-[11px] tabular-nums">
                      {node.cpu}%
                    </p>
                    <Progress value={node.cpu} className="h-1.5" />
                  </TableCell>
                  <TableCell className="w-[88px] px-2 py-2">
                    <p className="mb-1 font-mono text-[11px] tabular-nums">
                      {node.memory}%
                    </p>
                    <Progress value={node.memory} className="h-1.5" />
                  </TableCell>
                  <TableCell className="hidden px-2 py-2 font-mono text-[11px] text-muted-foreground sm:table-cell">
                    {node.uptime}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export { NodesTile };
