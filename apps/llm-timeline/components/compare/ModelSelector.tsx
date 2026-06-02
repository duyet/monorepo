import { Plus, Search, X } from "lucide-react";
import type { Model } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MAX_COMPARE } from "./compare-utils";

interface ModelSelectorProps {
  selectedModels: Model[];
  availableModels: Model[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showSelector: boolean;
  setShowSelector: (show: boolean) => void;
  addModel: (model: Model) => void;
  removeModel: (modelName: string) => void;
}

export function ModelSelector({
  selectedModels,
  availableModels,
  searchQuery,
  setSearchQuery,
  showSelector,
  setShowSelector,
  addModel,
  removeModel,
}: ModelSelectorProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-foreground">
        Model Comparison
      </h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {selectedModels.map((model) => (
          <div
            key={model.name}
            className="flex items-center gap-2 rounded-[var(--rd-r)] border border-border bg-card py-1.5 pl-3 pr-1.5 text-foreground"
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
                      <div className="font-medium truncate">{model.name}</div>
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
  );
}
