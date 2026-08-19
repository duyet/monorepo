"use client";

import { Badge } from "@duyet/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@duyet/components/ui/table";
import { Box, Cuboid, Layers, RotateCcw } from "lucide-react";
import { useK8s } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusStyles: Record<string, string> = {
  running: "bg-[var(--rd-ok)]",
  pending: "bg-[var(--rd-warn)]",
  crashloop: "bg-destructive",
  completed: "bg-muted-foreground",
};

export function K8sInfo() {
  const { pods, summary } = useK8s();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-4">
      <StatCell
        icon={Cuboid}
        label="Namespaces"
        value={String(summary.namespaces)}
      />
      <StatCell
        icon={Box}
        label="Pods"
        value={`${summary.running}/${summary.pods}`}
        sub="running"
      />
      <StatCell
        icon={Layers}
        label="Deployments"
        value={String(summary.deployments)}
      />
      <StatCell
        icon={RotateCcw}
        label="Restarts"
        value={String(summary.totalRestarts)}
        sub="total"
      />
      </div>

      <Card className="min-w-0">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Pods</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-8 px-2 text-[11px]">Name</TableHead>
                <TableHead className="h-8 px-2 text-[11px]">NS</TableHead>
                <TableHead className="hidden h-8 px-2 text-[11px] sm:table-cell">
                  Node
                </TableHead>
                <TableHead className="h-8 px-2 text-[11px]">Status</TableHead>
                <TableHead className="h-8 px-2 text-right text-[11px]">R</TableHead>
                <TableHead className="hidden h-8 px-2 text-right text-[11px] md:table-cell">
                  CPU
                </TableHead>
                <TableHead className="hidden h-8 px-2 text-right text-[11px] md:table-cell">
                  Mem
                </TableHead>
                <TableHead className="h-8 px-2 text-right text-[11px]">Age</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pods.map((pod) => (
                <TableRow key={`${pod.namespace}/${pod.name}`}>
                  <TableCell className="max-w-[180px] truncate px-2 py-2 font-mono text-xs">
                    {pod.name}
                  </TableCell>
                  <TableCell className="px-2 py-2">
                    <Badge variant="outline" className="font-mono text-[10px] font-normal">
                      {pod.namespace}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden px-2 py-2 text-[11px] text-muted-foreground sm:table-cell">
                    {pod.node}
                  </TableCell>
                  <TableCell className="px-2 py-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
                      <span
                        className={`size-1.5 rounded-full ${statusStyles[pod.status] ?? "bg-muted-foreground"}`}
                      />
                      {pod.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-2 text-right font-mono text-[11px] tabular-nums">
                    {pod.restarts}
                  </TableCell>
                  <TableCell className="hidden px-2 py-2 text-right font-mono text-[11px] tabular-nums md:table-cell">
                    {pod.cpu}
                  </TableCell>
                  <TableCell className="hidden px-2 py-2 text-right font-mono text-[11px] tabular-nums md:table-cell">
                    {pod.memory}
                  </TableCell>
                  <TableCell className="px-2 py-2 text-right text-[11px] text-muted-foreground">
                    {pod.age}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCell({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Box;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="min-w-0 bg-[#101114] p-5">
      <div className="flex items-center gap-1.5 text-[var(--rd-text-3)]">
        <Icon className="size-3.5" />
        <p className="text-[12px]">{label}</p>
      </div>
      <p className="mt-2 font-mono text-[28px] font-semibold leading-none tracking-tight tabular-nums text-[var(--rd-text)]">
        {value}
      </p>
      {sub ? (
        <p className="mt-2 font-mono text-[12px] text-[var(--rd-text-3)]">{sub}</p>
      ) : null}
    </div>
  );
}
