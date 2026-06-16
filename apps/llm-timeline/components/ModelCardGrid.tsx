import { cn } from "@duyet/libs/utils";
import { Check, ExternalLink } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
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

const LICENSE_COLORS = {
  open: "bg-[var(--rd-ok)]",
  closed: "bg-[var(--rd-down)]",
  partial: "bg-[var(--rd-accent)]",
};

interface ModelCardGridProps {
  model: Model;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  onClick?: () => void;
  comparisonMode?: boolean;
}

export function ModelCardGrid({
  model,
  isSelectable,
  isSelected,
  onSelectionChange,
  onClick,
  comparisonMode,
}: ModelCardGridProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const relatedModels = useMemo(() => {
    return getRelatedModels(model, models, MODEL_CARD_RELATED_MODELS_LIMIT);
  }, [model]);

  const handleCompareAll = () => {
    const modelSlugs = relatedModels.map((m) => slugify(m.name));
    navigate({ to: "/compare", search: { models: modelSlugs.join(",") } });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <article
      className={cn(
        "rd-card rd-work-card flex flex-col relative group",
        isSelectable && isSelected && "ring-2 ring-[var(--rd-ring)] ring-offset-2 ring-offset-background"
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? "button" : "article"}
      aria-label={`${model.name} by ${model.org}`}
    >
      {isSelectable && comparisonMode && (
        <div className="absolute top-2 left-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectionChange?.(!isSelected);
            }}
            className={cn(
              "flex items-center justify-center transition-all w-5 h-5 rounded border-2",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rd-ring)]",
              isSelected
                ? "bg-foreground border-foreground"
                : "bg-card border-[var(--rd-border)] hover:border-foreground/60"
            )}
            aria-label={isSelected ? `Deselect ${model.name}` : `Select ${model.name} for comparison`}
          >
            {isSelected && <Check className="h-3 w-3 text-background" strokeWidth={3} />}
          </button>
        </div>
      )}

      {!isSelectable && !comparisonMode && (
        <div
          className={cn(
            "absolute top-2 right-2 shrink-0 w-2 h-2 rounded-full transition-all duration-300",
            LICENSE_COLORS[model.license as keyof typeof LICENSE_COLORS] || "bg-muted-foreground"
          )}
        />
      )}

      <div className="flex flex-col h-full">
        <div className="mb-3 flex items-start gap-2.5">
          <div className="shrink-0">
            <OrgAvatar org={model.org} size="md" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold font-[family-name:var(--font-sans)] tracking-tight text-foreground leading-snug truncate">
              {model.name}
            </h3>
            <p className="text-xs text-[var(--rd-text-3)] truncate">{model.org}</p>
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-[family-name:var(--font-mono)] text-[var(--rd-text-3)] tabular-nums">
            {model.date.slice(0, 7)}
          </span>
          {model.params && (
            <span className="font-[family-name:var(--font-mono)] font-medium text-foreground/80 tabular-nums">
              {model.params}
            </span>
          )}
        </div>

        <div className="mb-2 flex flex-wrap gap-1.5">
          <Badge variant={getTypeBadgeVariant(model.type)} className="text-[10px] px-2 py-0.5">
            {model.type}
          </Badge>
          <Badge
            variant={getLicenseBadgeVariant(model.license)}
            className="text-[10px] px-2 py-0.5"
          >
            {model.license}
          </Badge>
          {model.source && (
            <Badge
              variant={getSourceBadgeVariant(model.source)}
              className="text-[10px] px-2 py-0.5"
            >
              {model.source === "epoch" ? "Epoch" : "Curated"}
            </Badge>
          )}
        </div>

        <p className="text-sm leading-relaxed text-foreground/80 line-clamp-2 flex-1 mb-3">
          {model.desc}
        </p>

        {(model.domain || model.link || model.trainingCompute || model.trainingHardware) && (
          <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-[var(--rd-text-3)] border-t border-[var(--rd-line)] pt-2">
            {model.domain && (
              <span className="flex items-center gap-1">
                {model.link ? (
                  <a
                    href={model.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-[var(--rd-line)] underline-offset-2 text-foreground/70 hover:text-foreground transition-colors inline-flex items-center gap-1"
                  >
                    {model.domain}
                    <ExternalLink className="h-2.5 w-2.5" />
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
                className="underline decoration-[var(--rd-line)] underline-offset-2 text-foreground/70 hover:text-foreground inline-flex items-center gap-1"
              >
                Paper
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
            {model.trainingCompute && (
              <span className="font-[family-name:var(--font-mono)] tabular-nums">
                {model.trainingCompute} FLOP
              </span>
            )}
            {model.trainingHardware && <span>{model.trainingHardware}</span>}
          </div>
        )}

        {relatedModels.length > 0 && (
          <div className="border-t border-[var(--rd-line)] pt-2">
            <div className="flex items-center justify-between gap-2 mb-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--rd-text-3)] transition-all hover:text-foreground"
              >
                {isExpanded ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                )}
                <span>Related ({relatedModels.length})</span>
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompareAll();
                }}
                className="h-6 px-2 text-[10px]"
              >
                Compare All
              </Button>
            </div>

            {isExpanded && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                {relatedModels.map((related) => (
                  <a
                    key={related.name}
                    href={`#${related.name}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all hover:bg-[var(--rd-accent-bg)]"
                    title={related.desc}
                  >
                    <OrgAvatar org={related.org} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium text-foreground">
                        {related.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] text-[var(--rd-text-4)]">
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
                    <ExternalLink className="h-3 w-3 shrink-0 text-[var(--rd-text-4)]" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}