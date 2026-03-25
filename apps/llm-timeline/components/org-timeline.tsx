import type { Model } from "@/lib/data";
import { ModelCard } from "./model-card";
import { OrgAvatar } from "./org-avatar";

interface OrgTimelineProps {
  modelsByOrg: Map<string, Model[]>;
  liteMode?: boolean;
}

export function OrgTimeline({ modelsByOrg, liteMode }: OrgTimelineProps) {
  const sortedOrgs = Array.from(modelsByOrg.keys());

  if (sortedOrgs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          No models found matching your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedOrgs.map((org) => {
        const orgModels = modelsByOrg.get(org) || [];
        return (
          <div
            key={org}
            style={{
              contentVisibility: "auto",
              containIntrinsicSize: "0 500px",
            }}
          >
            {/* Org Header */}
            <div className="mb-6 flex items-center gap-4 overflow-hidden">
              <div className="shrink-0 overflow-hidden">
                <span
                  className="select-none text-3xl font-bold leading-none block font-[family-name:var(--font-mono)] whitespace-nowrap text-foreground/10"
                  aria-hidden="true"
                >
                  {org}
                </span>
              </div>
              <div className="h-px flex-1 min-w-0 shrink bg-gradient-to-r from-border to-transparent" />
              <div className="flex shrink-0 items-center gap-2">
                <OrgAvatar org={org} size="sm" />
                <span className="text-sm font-medium truncate max-w-[12rem] text-foreground">
                  {org}
                </span>
                <span className="text-xs uppercase tracking-widest font-[family-name:var(--font-mono)] text-muted-foreground">
                  {orgModels.length} model{orgModels.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Models for this org */}
            <div className="ml-2">
              {orgModels.map((model, index) => (
                <div
                  key={`${model.org}-${model.date}-${model.name}-${index}`}
                  className="transition-all rounded-xl"
                >
                  <ModelCard
                    model={model}
                    isLast={index === orgModels.length - 1}
                    lite={liteMode}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
