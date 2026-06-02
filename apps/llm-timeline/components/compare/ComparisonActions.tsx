import { Download } from "lucide-react";
import type { Model } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { MIN_COMPARE } from "./compare-utils";

interface ComparisonActionsProps {
  sortedModels: Model[];
}

function exportToCSV(sortedModels: Model[]) {
  if (sortedModels.length < MIN_COMPARE) return;
  const headers = [
    "Model",
    "Organization",
    "Release Date",
    "Parameters",
    "License",
    "Type",
    "Description",
  ];
  const rows = sortedModels.map((model) => [
    model.name,
    model.org,
    formatDate(model.date),
    model.params || "Unknown",
    model.license,
    model.type,
    `"${model.desc.replace(/"/g, '""')}"`,
  ]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `llm-comparison-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function ComparisonActions({ sortedModels }: ComparisonActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm mb-2 text-muted-foreground">
            Share this comparison:
          </p>
          <code className="text-sm px-2 py-1 rounded-[var(--rd-r-sm)] bg-[var(--rd-surface-2)] border border-border text-foreground">
            {typeof window !== "undefined"
              ? window.location.href
              : "/compare"}
          </code>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm mb-2 text-muted-foreground">
            Export comparison data:
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(sortedModels)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
