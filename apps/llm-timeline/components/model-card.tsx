import { cn } from "@duyet/libs/utils";
import { useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, ChevronUp, Link2, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { OrgAvatar } from "@/components/org-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Model } from "@/lib/data";
import { models } from "@/lib/data";
import {
  getLicenseBadgeVariant,
  getRelatedModels,
  getSourceBadgeVariant,
  getTypeBadgeVariant,
  MODEL_CARD_RELATED_MODELS_LIMIT,
  slugify,
} from "@/lib/utils";

interface ModelCardProps {
  model: Model;
  isLast?: boolean;
  lite?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
}

// License color mapping for visual indicator
const LICENSE_COLORS = {
  open: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
  closed: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]",
  partial: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]",
};

export function ModelCard({
  model,
  isLast,
  lite,
  isSelectable,
  isSelected,
  onSelectionChange,
}: ModelCardProps) {
  if (lite) {
    return (
      <div
        className="group relative flex items-center gap-3 py-2 transition-all hover:bg-accent/50 rounded-lg px-2 -mx-2"
        style={{ minHeight: "36px" }}
      >
        {/* Selection checkbox */}
        {isSelectable && (
          <button
            onClick={() => onSelectionChange?.(!isSelected)}
            className={cn(
              "shrink-0 relative flex items-center justify-center transition-all",
              "w-5 h-5 rounded border-2",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected
                ? "bg-foreground border-foreground"
                : "bg-card border-border hover:border-foreground/60"
            )}
            aria-label={
              isSelected
                ? `Deselect ${model.name}`
                : `Select ${model.name} for comparison`
            }
          >
            {isSelected && (
              <Check className="h-3 w-3 text-background" strokeWidth={3} />
            )}
          </button>
        )}

        {/* License indicator with glow */}
        {!isSelectable && (
          <div
            className={cn(
              "shrink-0 w-2 h-2 rounded-full transition-all duration-300",
              LICENSE_COLORS[model.license as keyof typeof LICENSE_COLORS] || "bg-muted-foreground"
            )}
          />
        )}

        {/* Model name on left */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <OrgAvatar org={model.org} size="sm" />
          <span className="truncate text-sm font-medium text-foreground">
            {model.name}
          </span>
        </div>

        {/* Elegant separator */}
        <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent mx-2" />

        {/* Year and metadata on right */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-[family-name:var(--font-mono)] text-muted-foreground tabular-nums">
            {model.date.slice(0, 4)}
          </span>
          <Badge variant={getTypeBadgeVariant(model.type)} className="text-[10px] px-1.5 py-0">
            {model.type}
          </Badge>
          <Badge
            variant={getLicenseBadgeVariant(model.license)}
            className="text-[10px] px-1.5 py-0"
          >
            {model.license}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-start gap-4 pb-6 group">
      {/* Enhanced Timeline Line with gradient */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 h-full w-px bg-gradient-to-b from-border via-border/50 to-transparent" />
      )}

      {/* Org logo with enhanced styling or selection checkbox */}
      {isSelectable ? (
        <div className="relative z-10 shrink-0 bg-background rounded-lg">
          <button
            onClick={() => onSelectionChange?.(!isSelected)}
            className={cn(
              "flex items-center justify-center transition-all rounded-lg p-1.5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isSelected
                ? "bg-foreground shadow-lg"
                : "bg-card border border-border hover:border-foreground/40 hover:shadow-md"
            )}
            aria-label={
              isSelected
                ? `Deselect ${model.name}`
                : `Select ${model.name} for comparison`
            }
          >
            {isSelected ? (
              <Check className="h-5 w-5 text-background" strokeWidth={2.5} />
            ) : (
              <OrgAvatar org={model.org} size="sm" />
            )}
          </button>
        </div>
      ) : (
        <div className="relative z-10 shrink-0">
          {/* Glow effect behind avatar */}
          <div className={cn(
            "absolute inset-0 rounded-full blur-md opacity-50 transition-opacity duration-300",
            LICENSE_COLORS[model.license as keyof typeof LICENSE_COLORS] || "bg-muted-foreground"
          )} style={{ transform: "scale(1.5)" }} />
          <div className="relative rounded-lg p-1.5 bg-background">
            <OrgAvatar org={model.org} size="sm" />
          </div>
        </div>
      )}

      {/* Enhanced Card */}
      <div
        className={cn(
          "flex-1 rounded-xl border transition-all duration-300 bg-card/50 backdrop-blur-sm",
          "hover:border-foreground/15 hover:shadow-lg hover:bg-card",
          isSelectable && isSelected
            ? "ring-2 ring-ring ring-offset-2 ring-offset-background border-foreground/20 shadow-md"
            : "border-border/50"
        )}
      >
        {/* Header row with improved hierarchy */}
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] tracking-tight text-foreground leading-tight">
              {model.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {model.org}
            </p>
          </div>

          {/* Date + params with monospace */}
          <div className="text-right space-y-0.5">
            <div className="text-sm font-[family-name:var(--font-mono)] text-muted-foreground tabular-nums">
              {model.date.slice(0, 7)}
            </div>
            {model.params && (
              <div className="text-sm font-[family-name:var(--font-mono)] font-medium text-foreground/80 tabular-nums">
                {model.params}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Badges */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          <Badge variant={getTypeBadgeVariant(model.type)} className="text-xs">
            {model.type}
          </Badge>
          <Badge
            variant={getLicenseBadgeVariant(model.license)}
            className="text-xs"
          >
            {model.license}
          </Badge>
          {model.source && (
            <Badge
              variant={getSourceBadgeVariant(model.source)}
              className="text-xs"
            >
              {model.source === "epoch" ? "Epoch" : "Curated"}
            </Badge>
          )}
        </div>

        {/* Description with better readability */}
        <p className="text-sm leading-relaxed text-foreground/80 line-clamp-3">
          {model.desc}
        </p>

        {/* Enhanced Metadata */}
        {(model.domain ||
          model.link ||
          model.trainingCompute ||
          model.trainingHardware ||
          model.authors) && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border/50 pt-3 text-xs text-muted-foreground">
            {model.domain && (
              <span className="flex items-center gap-1.5">
                {model.link ? (
                  <a
                    href={model.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-border/50 underline-offset-2 text-foreground/70 hover:text-foreground transition-colors inline-flex items-center gap-1"
                  >
                    {model.domain}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  model.domain
                )}
              </span>
            )}
            {!model.domain && model.link && (
              <a
                href={model.link}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-border/50 underline-offset-2 text-foreground/70 hover:text-foreground inline-flex items-center gap-1"
              >
                Paper
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {model.trainingCompute && (
              <span className="font-[family-name:var(--font-mono)] tabular-nums">
                {model.trainingCompute} FLOP
              </span>
            )}
            {model.trainingHardware && <span>{model.trainingHardware}</span>}
            {model.authors && (
              <span className="truncate max-w-[200px]" title={model.authors}>
                {model.authors}
              </span>
            )}
          </div>
        )}

        {/* Related Models Section */}
        <RelatedModelsSection model={model} />
      </div>
    </div>
  );
}

interface RelatedModelsSectionProps {
  model: Model;
}

function RelatedModelsSection({ model }: RelatedModelsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const relatedModels = useMemo(() => {
    return getRelatedModels(model, models, MODEL_CARD_RELATED_MODELS_LIMIT);
  }, [model]); // eslint-disable-line react-hooks/exhaustive-deps

  if (relatedModels.length === 0) {
    return null;
  }

  const handleCompareAll = () => {
    const modelSlugs = relatedModels.map((m) => slugify(m.name));
    navigate({ to: "/compare", search: { models: modelSlugs.join(",") } });
  };

  return (
    <div className="mt-4 border-t border-border/50 pt-3">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-all hover:text-foreground"
        >
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          <span>Related Models ({relatedModels.length})</span>
        </button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCompareAll}
          className="h-7 px-2.5 text-xs"
        >
          Compare All
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-3 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          {relatedModels.map((related) => (
            <a
              key={related.name}
              href={`#${related.name}`}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all hover:bg-accent hover:shadow-sm"
              title={related.desc}
            >
              <OrgAvatar org={related.org} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-foreground">
                  {related.name}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{related.org}</span>
                  {related.params && (
                    <>
                      <span>·</span>
                      <span className="font-[family-name:var(--font-mono)] tabular-nums">
                        {related.params}
                      </span>
                    </>
                  )}
                  <span>·</span>
                  <span className="font-[family-name:var(--font-mono)] tabular-nums">
                    {related.date.slice(0, 4)}
                  </span>
                </div>
              </div>
              <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
