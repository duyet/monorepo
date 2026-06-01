import { parseParamValue } from "@duyet/libs";
import type { Model } from "@/lib/data";
import { getLicenseBarColor } from "@/lib/utils";

interface ParameterChartProps {
  sortedModels: Model[];
  maxParams: number;
}

export function ParameterChart({ sortedModels, maxParams }: ParameterChartProps) {
  return (
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
                    backgroundColor: getLicenseBarColor(model.license),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs mt-3 text-muted-foreground">
        * Models with unknown parameter counts are excluded from the chart
      </p>
    </div>
  );
}
