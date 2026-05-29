import { parseParamValue } from "@duyet/libs";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { Download, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Model } from "@/lib/data";
import { models } from "@/lib/data";
import {
  formatDate,
  getLicenseBarColor,
  getLicenseBadgeVariant,
  slugify,
} from "@/lib/utils";

const MAX_COMPARE = 4;
const MIN_COMPARE = 2;

function parseModelNamesFromParam(params: string | undefined): string[] {
  if (!params) return [];
  return params.split(",").filter(Boolean).slice(0, MAX_COMPARE);
}

export const Route = createFileRoute("/compare")({
  validateSearch: (search: Record<string, unknown>) => ({
    models: (search.models as string | undefined) ?? "",
  }),
  component: ComparePage,
});

function ComparePage() {
  const search = useSearch({ from: "/compare" });
  const navigate = useNavigate({ from: "/compare" });
  const urlModels = parseModelNamesFromParam(search.models);

  const getModelsFromNames = (names: string[]): Model[] => {
    const found: Model[] = [];
    for (const name of names) {
      const model = models.find((m) => slugify(m.name) === slugify(name));
      if (model && !found.find((f) => f.name === model.name)) {
        found.push(model);
      }
    }
    return found;
  };

  const [selectedModels, setSelectedModels] = useState<Model[]>(() =>
    getModelsFromNames(urlModels)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSelector, setShowSelector] = useState(false);

  const updateUrl = (next: Model[]) => {
    navigate({
      search: {
        models:
          next.length > 0 ? next.map((m) => slugify(m.name)).join(",") : "",
      },
      replace: true,
    });
  };

  const availableModels = useMemo(() => {
    return models.filter((model) => {
      if (selectedModels.find((m) => m.name === model.name)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          model.name.toLowerCase().includes(q) ||
          model.org.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchQuery, selectedModels]);

  const sortedModels = useMemo(() => {
    return [...selectedModels].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [selectedModels]);

  const addModel = (model: Model) => {
    if (selectedModels.length >= MAX_COMPARE) return;
    if (selectedModels.find((m) => m.name === model.name)) return;
    const next = [...selectedModels, model];
    setSelectedModels(next);
    updateUrl(next);
    setSearchQuery("");
    setShowSelector(false);
  };

  const removeModel = (modelName: string) => {
    const next = selectedModels.filter((m) => m.name !== modelName);
    setSelectedModels(next);
    updateUrl(next);
  };

  const maxParams = Math.max(
    ...sortedModels.map((m) => parseParamValue(m.params) || 0),
    1
  );

  const hasComparison = sortedModels.length >= MIN_COMPARE;

  const exportToCSV = () => {
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
  };

  return (
    <PageLayout description="Compare LLM models side-by-side">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Model Comparison
          </h2>

          <div className="flex flex-wrap gap-2 mb-4">
            {sortedModels.map((model) => (
              <div
                key={model.name}
                className="flex items-center gap-2 rounded-xl border border-border bg-card py-1.5 pl-3 pr-1.5 text-foreground"
              >
                <span className="font-medium">{model.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={() => removeModel(model.name)}
                  aria-label={`Remove ${model.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {selectedModels.length < MAX_COMPARE && (
              <Button
                variant="outline"
                onClick={() => setShowSelector(!showSelector)}
                className="border-dashed text-muted-foreground"
              >
                <Plus className="h-4 w-4" />
                {selectedModels.length === 0
                  ? "Add models to compare"
                  : "Add another"}
              </Button>
            )}
          </div>

          {showSelector && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search models by name or organization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 flex-1 rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSelector(false)}
                  >
                    Cancel
                  </Button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-0.5">
                  {availableModels.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">
                      No matching models found
                    </p>
                  ) : (
                    availableModels.slice(0, 50).map((model) => (
                      <Button
                        key={model.name}
                        variant="ghost"
                        onClick={() => addModel(model)}
                        className="h-auto w-full justify-between rounded-lg px-3 py-2 text-left font-normal"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {model.name}
                          </div>
                          <div className="text-sm truncate text-muted-foreground">
                            {model.org}
                            {model.params && ` · ${model.params}`}
                          </div>
                        </div>
                        <Plus className="h-4 w-4 flex-shrink-0 ml-2 text-muted-foreground" />
                      </Button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {sortedModels.length > 0 ? (
          <div className="space-y-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
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
                <TableRow>
                  <TableCell className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Type
                  </TableCell>
                  {sortedModels.map((model) => (
                    <TableCell key={model.name} className="capitalize">
                      {model.type}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="border-b-0">
                  <TableCell className="align-top text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Description
                  </TableCell>
                  {sortedModels.map((model) => (
                    <TableCell key={model.name} className="text-sm">
                      {model.desc}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>

            {sortedModels.some((m) => m.params) && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Parameter Count Comparison
                </h3>
                <div className="space-y-3">
                  {sortedModels.map((model) => {
                    const paramValue = parseParamValue(model.params);
                    if (!paramValue) return null;
                    const percentage = (paramValue / maxParams) * 100;
                    return (
                      <div key={model.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-foreground">
                            {model.name}
                          </span>
                          <span className="font-[family-name:var(--font-mono)] text-muted-foreground">
                            {model.params}
                          </span>
                        </div>
                        <div className="h-7 rounded-lg overflow-hidden relative bg-muted">
                          <div
                            className="h-full rounded-lg transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: getLicenseBarColor(
                                model.license
                              ),
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs mt-3 text-muted-foreground">
                  * Models with unknown parameter counts are excluded from the
                  chart
                </p>
              </div>
            )}

            {hasComparison && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm mb-2 text-muted-foreground">
                      Share this comparison:
                    </p>
                    <code className="text-sm px-2 py-1 rounded bg-muted border border-border text-foreground">
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
                      onClick={exportToCSV}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download CSV
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg mb-2 text-muted-foreground">
                Select 2-4 models to compare
              </p>
              <p className="text-sm text-muted-foreground">
                Click the "Add models" button above to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
