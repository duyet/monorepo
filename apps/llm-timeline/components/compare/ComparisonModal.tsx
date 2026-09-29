import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, getLicenseBadgeVariant } from "@/lib/utils";
import { parseParamValue } from "@duyet/libs";
import { getLicenseBarColor } from "@/lib/utils";
import { getMaxParams, sortModelsByDateDesc } from "./compare-utils";
import type { Model } from "@/lib/data";

interface ComparisonModalProps {
  models: Model[];
  onClose: () => void;
}

export function ComparisonModal({ models, onClose }: ComparisonModalProps) {
  const sortedModels = sortModelsByDateDesc(models);

  const maxParams = getMaxParams(sortedModels);

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-[var(--rd-border)] p-6 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Model Comparison
            </h2>
            <p className="text-sm text-muted-foreground">
              {sortedModels.length} model{sortedModels.length > 1 ? "s" : ""}{" "}
              selected
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close comparison"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--rd-surface-2)]">
              <TableHead className="w-32 text-xs uppercase tracking-wider text-muted-foreground">
                Metric
              </TableHead>
              {sortedModels.map((model) => (
                <TableHead key={model.name}>{model.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Organization
              </TableCell>
              {sortedModels.map((model) => (
                <TableCell key={model.name}>{model.org}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Release Date
              </TableCell>
              {sortedModels.map((model) => (
                <TableCell
                  key={model.name}
                  className="font-[family-name:var(--font-mono)] text-sm"
                >
                  {formatDate(model.date)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Parameters
              </TableCell>
              {sortedModels.map((model) => (
                <TableCell
                  key={model.name}
                  className="font-[family-name:var(--font-mono)] text-sm"
                >
                  {model.params || "Unknown"}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                License
              </TableCell>
              {sortedModels.map((model) => (
                <TableCell key={model.name}>
                  <Badge variant={getLicenseBadgeVariant(model.license)}>
                    {model.license}
                  </Badge>
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="border-b-0">
              <TableCell className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Type
              </TableCell>
              {sortedModels.map((model) => (
                <TableCell key={model.name} className="capitalize">
                  {model.type}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>

        {sortedModels.some((m) => m.params) && (
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Parameter Count Comparison
            </h3>
            <div className="space-y-3">
              {sortedModels.map((model) => {
                const paramValue = parseParamValue(model.params);
                if (!paramValue) return null;
                const percentage = (paramValue / maxParams) * 100;
                return (
                  <div key={model.name}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {model.name}
                      </span>
                      <span className="font-[family-name:var(--font-mono)] text-muted-foreground">
                        {model.params}
                      </span>
                    </div>
                    <div className="relative h-7 overflow-hidden rounded-lg bg-[var(--rd-surface-2)]">
                      <div
                        className="h-full rounded-lg transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getLicenseBarColor(model.license),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
