import { cn } from "@duyet/libs/utils";
import { useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, ChevronUp, Link2 } from "lucide-react";
import { useMemo, useState } from "react";
import { OrgAvatar } from "@/components/org-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Model } from "@/lib/data";
import { models } from "@/lib/data";
import {
  getLicenseAccent,
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
        className="relative flex items-center gap-3 py-1.5 group"
        style={{ minHeight: "32px" }}
      >
        {/* Selection checkbox */}
        {isSelectable && (
          <button
            onClick={() => onSelectionChange?.(!isSelected)}
            className={cn(
              "shrink-0 relative flex items-center justify-center transition-all",
              "w-5 h-5 rounded border",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isSelected
                ? "bg-foreground border-foreground"
                : "bg-card border-border hover:border-foreground/40"
            )}
            aria-label={
              isSelected
                ? `Deselect ${model.name}`
                : `Select ${model.name} for comparison`
            }
          >
            {isSelected && (
              <Check className="h-3 w-3 text-background" />
            )}
          </button>
        )}

        {/* Small dot indicator with license color */}
        {!isSelectable && (
          <div
            className={cn(
              "shrink-0 w-2 h-2 rounded-full",
              model.license === "open"
                ? "bg-emerald-400 dark:bg-emerald-500"
                : model.license === "closed"
                  ? "bg-red-400 dark:bg-red-500"
                  : model.license === "partial"
                    ? "bg-indigo-400 dark:bg-indigo-500"
                    : "bg-neutral-300 dark:bg-neutral-600"
            )}
          />
        )}

        {/* Model name on left */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <OrgAvatar org={model.org} size="sm" />
          <span className="truncate text-sm font-medium text-foreground">
            {model.name}
          </span>
        </div>

        {/* Dots separator */}
        <div className="flex-1 px-2 opacity-30 bg-[length:4px_4px] bg-repeat-x bg-center [background-image:radial-gradient(circle,rgb(212_212_212)_1px,transparent_1px)] dark:[background-image:radial-gradient(circle,rgb(64_64_64)_1px,transparent_1px)]" />

        {/* Year and metadata on right */}
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-xs font-[family-name:var(--font-mono)] text-muted-foreground">
            {model.date.slice(0, 4)}
          </span>
          <Badge variant={getTypeBadgeVariant(model.type)}>{model.type}</Badge>
          <Badge variant={getLicenseBadgeVariant(model.license)}>
            {model.license}
          </Badge>
          {model.source && (
            <Badge variant={getSourceBadgeVariant(model.source)}>
              {model.source === "epoch" ? "Epoch" : "Curated"}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-start gap-3 pb-6 group">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[13px] top-0 h-full w-px bg-border" />
      )}

      {/* Org logo as timeline dot or selection checkbox */}
      {isSelectable ? (
        <div className="relative z-10 shrink-0 bg-background">
          <button
            onClick={() => onSelectionChange?.(!isSelected)}
            className={cn(
              "flex items-center justify-center transition-all rounded-lg p-1",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isSelected
                ? "bg-foreground"
                : "bg-card border border-border hover:border-foreground/40"
            )}
            aria-label={
              isSelected
                ? `Deselect ${model.name}`
                : `Select ${model.name} for comparison`
            }
          >
            {isSelected ? (
              <Check className="h-5 w-5 text-background" />
            ) : (
              <OrgAvatar org={model.org} size="sm" />
            )}
          </button>
        </div>
      ) : (
        <div className="relative z-10 shrink-0 rounded-lg p-1 bg-background">
          <OrgAvatar org={model.org} size="sm" />
        </div>
      )}

      {/* Card with license accent border */}
      <div
        className={cn(
          "flex-1 rounded-xl border border-l-[3px] p-4 transition-all bg-card",
          getLicenseAccent(model.license),
          "hover:border-foreground/20 hover:shadow-sm",
          isSelectable && isSelected
            ? "ring-2 ring-ring ring-offset-2 border-foreground/20"
            : "border-border"
        )}
      >
        {/* Header row */}
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold truncate text-foreground">
              {model.name}
            </h3>
            <p className="text-xs truncate text-muted-foreground">
              {model.org}
            </p>
          </div>

          {/* Date + params */}
          <div className="text-right">
            <div className="text-xs font-[family-name:var(--font-mono)] text-muted-foreground">
              {model.date.slice(0, 7)}
            </div>
            {model.params && (
              <div className="text-xs font-[family-name:var(--font-mono)] font-medium text-foreground/70">
                {model.params}
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="mb-2 flex flex-wrap gap-1.5">
          <Badge variant={getTypeBadgeVariant(model.type)}>{model.type}</Badge>
          <Badge variant={getLicenseBadgeVariant(model.license)}>
            {model.license}
          </Badge>
          {model.source && (
            <Badge variant={getSourceBadgeVariant(model.source)}>
              {model.source === "epoch" ? "Epoch" : "Curated"}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed line-clamp-3 text-muted-foreground">
          {model.desc}
        </p>

        {/* Metadata (from Epoch.ai or other enriched sources) */}
        {(model.domain ||
          model.link ||
          model.trainingCompute ||
          model.trainingHardware ||
          model.authors) && (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-2 text-[11px] text-muted-foreground">
            {model.domain && (
              <span>
                {model.link ? (
                  <a
                    href={model.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-border underline-offset-2 text-foreground/70 hover:text-foreground"
                  >
                    {model.domain}
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
                className="underline decoration-border underline-offset-2 text-foreground/70 hover:text-foreground"
              >
                Paper
              </a>
            )}
            {model.trainingCompute && (
              <span className="font-[family-name:var(--font-mono)]">
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
    <div className="mt-3 border-t border-border pt-2">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-all hover:text-foreground"
        >
          {isExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
          <span>Related Models ({relatedModels.length})</span>
        </button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCompareAll}
          className="h-6 px-2 text-[11px]"
        >
          Compare All
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-2 flex flex-col gap-1">
          {relatedModels.map((related) => (
            <a
              key={related.name}
              href={`#${related.name}`}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent"
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
                      <span className="font-[family-name:var(--font-mono)]">
                        {related.params}
                      </span>
                    </>
                  )}
                  <span>·</span>
                  <span>{related.date.slice(0, 4)}</span>
                </div>
              </div>
              <Link2 className="h-3 w-3 shrink-0 text-muted-foreground" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
