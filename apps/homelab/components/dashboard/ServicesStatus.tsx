"use client";

import { Badge } from "@duyet/components/ui/badge";
import { Button } from "@duyet/components/ui/button";
import { Input } from "@duyet/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@duyet/components/ui/table";
import { Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useServices } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ServicesStatus() {
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { allServices, namespaces, servicesByNamespace } = useServices();

  const filteredServices = useMemo(() => {
    let result = selectedNamespace
      ? servicesByNamespace[selectedNamespace] || []
      : allServices;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (service) =>
          service.name.toLowerCase().includes(query) ||
          service.namespace.toLowerCase().includes(query) ||
          service.node.toLowerCase().includes(query),
      );
    }

    return result;
  }, [selectedNamespace, searchQuery, allServices, servicesByNamespace]);

  return (
    <Card className="min-w-0">
      <CardHeader className="flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <CardTitle>
          Services
          <span className="ml-2 font-mono text-[11px] font-normal text-muted-foreground">
            {filteredServices.length}/{allServices.length}
          </span>
        </CardTitle>
        <div className="relative w-full sm:max-w-xs sm:ml-auto">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search name, namespace, node"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
            aria-label="Search services"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Namespace">
          <FilterChip
            active={selectedNamespace === null}
            onClick={() => setSelectedNamespace(null)}
          >
            All ({allServices.length})
          </FilterChip>
          {namespaces.map((namespace) => (
            <FilterChip
              key={namespace}
              active={selectedNamespace === namespace}
              onClick={() => setSelectedNamespace(namespace)}
            >
              {namespace} ({servicesByNamespace[namespace]?.length || 0})
            </FilterChip>
          ))}
        </div>

        {filteredServices.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No services matching &quot;{searchQuery}&quot;
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-8 px-2 text-[11px]">Name</TableHead>
                <TableHead className="h-8 px-2 text-[11px]">NS</TableHead>
                <TableHead className="hidden h-8 px-2 text-[11px] sm:table-cell">
                  Node
                </TableHead>
                <TableHead className="h-8 px-2 text-right text-[11px]">CPU</TableHead>
                <TableHead className="h-8 px-2 text-right text-[11px]">Mem</TableHead>
                <TableHead className="hidden h-8 px-2 text-right text-[11px] md:table-cell">
                  Uptime
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow
                  key={`${service.name}-${service.node}`}
                  className={service.status !== "running" ? "opacity-50" : undefined}
                >
                  <TableCell className="px-2 py-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span
                        className={`size-1.5 shrink-0 rounded-full ${
                          service.status === "running"
                            ? "bg-[var(--rd-ok)]"
                            : "bg-destructive"
                        }`}
                      />
                      <span className="truncate font-mono text-xs">{service.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-2">
                    <Badge variant="outline" className="font-mono text-[10px] font-normal">
                      {service.namespace}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden px-2 py-2 font-mono text-[11px] text-muted-foreground sm:table-cell">
                    {service.node}:{service.port}
                  </TableCell>
                  <TableCell className="px-2 py-2 text-right font-mono text-[11px] tabular-nums">
                    {service.cpu}%
                  </TableCell>
                  <TableCell className="px-2 py-2 text-right font-mono text-[11px] tabular-nums">
                    {service.memory}MB
                  </TableCell>
                  <TableCell className="hidden px-2 py-2 text-right font-mono text-[11px] text-muted-foreground md:table-cell">
                    {service.uptime}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      size="xs"
      variant={active ? "default" : "outline"}
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className="h-6 px-2 text-[11px]"
    >
      {children}
    </Button>
  );
}
