import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import {
  ComparisonActions,
} from "@/components/compare/ComparisonActions";
import {
  ComparisonTable,
} from "@/components/compare/ComparisonTable";
import {
  ModelSelector,
} from "@/components/compare/ModelSelector";
import {
  ParameterChart,
} from "@/components/compare/ParameterChart";
import {
  MAX_COMPARE,
  MIN_COMPARE,
  parseModelNamesFromParam,
} from "@/components/compare/compare-utils";
import type { Model } from "@/lib/data";
import { models } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { parseParamValue } from "@duyet/libs";

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

  return (
    <PageLayout description="Compare LLM models side-by-side">
      <div className="space-y-6">
        <ModelSelector
          selectedModels={sortedModels}
          availableModels={availableModels}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showSelector={showSelector}
          setShowSelector={setShowSelector}
          addModel={addModel}
          removeModel={removeModel}
        />

        {sortedModels.length > 0 ? (
          <div className="space-y-6">
            <ComparisonTable sortedModels={sortedModels} />

            {sortedModels.some((m) => m.params) && (
              <ParameterChart
                sortedModels={sortedModels}
                maxParams={maxParams}
              />
            )}

            {hasComparison && (
              <ComparisonActions sortedModels={sortedModels} />
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
