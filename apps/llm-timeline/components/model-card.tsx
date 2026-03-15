"use client";

import { cn } from "@duyet/libs/utils";
import { Check, ChevronDown, ChevronUp, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { OrgAvatar } from "@/components/org-avatar";
import type { Model } from "@/lib/data";
import { models } from "@/lib/data";
import {
  getLicenseColor,
  getRelatedModels,
  getSourceColor,
  getTypeColor,
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
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
              "dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2",
              isSelected
                ? "bg-neutral-700 dark:bg-neutral-300 border-neutral-700 dark:border-neutral-300"
                : "bg-white dark:bg-[#111] border-neutral-200 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/30"
            )}
            aria-label={
              isSelected
                ? `Deselect ${model.name}`
                : `Select ${model.name} for comparison`
            }
          >
            {isSelected && <Check className="h-3 w-3 text-white dark:text-black" />}
          </button>
        )}

        {/* Small dot indicator */}
        {!isSelectable && (
          <div
            className={cn(
              "shrink-0 w-2 h-2 rounded-full",
              model.type === "milestone"
                ? "bg-neutral-500 dark:bg-neutral-400"
                : "bg-neutral-300 dark:bg-neutral-600"
            )}
          />
        )}

        {/* Model name on left */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <OrgAvatar org={model.org} size="sm" />
          <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {model.name}
          </span>
        </div>

        {/* Dots separator */}
        <div
          className="flex-1 px-2 opacity-40 bg-[length:4px_4px] bg-repeat-x bg-center [background-image:radial-gradient(circle,rgb(212_212_212)_1px,transparent_1px)] dark:[background-image:radial-gradient(circle,rgb(64_64_64)_1px,transparent_1px)]"
        />

        {/* Year and metadata on right */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-[family-name:var(--font-mono)] text-neutral-500 dark:text-neutral-400">
            {model.date.slice(0, 4)}
          </span>
          <span
            className={cn(
              "rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              getTypeColor(model.type)
            )}
          >
            {model.type}
          </span>
          <span
            className={cn(
              "rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              getLicenseColor(model.license)
            )}
          >
            {model.license}
          </span>
          {model.source && (
            <span
              className={cn(
                "rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                getSourceColor(model.source)
              )}
            >
              {model.source === "epoch" ? "Epoch" : "Curated"}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-3 pb-6 group">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[13px] top-0 h-full w-px bg-neutral-200 dark:bg-white/10" />
      )}

      {/* Org logo as timeline dot or selection checkbox */}
      {isSelectable ? (
        <div className="relative z-10 shrink-0 bg-[#fbf7f0] dark:bg-[#1f1f1f]">
          <button
            onClick={() => onSelectionChange?.(!isSelected)}
            className={cn(
              "flex items-center justify-center transition-all rounded-lg p-1",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
              "dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2",
              isSelected
                ? "bg-neutral-700 dark:bg-neutral-300"
                : "bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/30"
            )}
            aria-label={
              isSelected
                ? `Deselect ${model.name}`
                : `Select ${model.name} for comparison`
            }
          >
            {isSelected ? (
              <Check className="h-5 w-5 text-white dark:text-black" />
            ) : (
              <OrgAvatar org={model.org} size="sm" />
            )}
          </button>
        </div>
      ) : (
        <div className="relative z-10 shrink-0 rounded-lg p-1 bg-[#fbf7f0] dark:bg-[#1f1f1f]">
          <OrgAvatar org={model.org} size="sm" />
        </div>
      )}

      {/* Card */}
      <div
        className={cn(
          "flex-1 rounded-xl border p-4 transition-all bg-white dark:bg-[#111]",
          "hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm",
          isSelectable && isSelected
            ? "ring-2 ring-neutral-400 dark:ring-neutral-500 ring-offset-2 border-neutral-400 dark:border-white/20"
            : "border-neutral-200 dark:border-white/10"
        )}
      >
        {/* Header row */}
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold truncate text-neutral-900 dark:text-neutral-100">
              {model.name}
            </h3>
            <p className="text-xs truncate text-neutral-500 dark:text-neutral-400">
              {model.org}
            </p>
          </div>

          {/* Date + params */}
          <div className="text-right">
            <div className="text-xs font-[family-name:var(--font-mono)] text-neutral-500 dark:text-neutral-400">
              {model.date.slice(0, 7)}
            </div>
            {model.params && (
              <div className="text-xs font-[family-name:var(--font-mono)] text-neutral-500 dark:text-neutral-400">
                {model.params}
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="mb-2 flex gap-1.5">
          <span
            className={cn(
              "rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              getTypeColor(model.type)
            )}
          >
            {model.type}
          </span>
          <span
            className={cn(
              "rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              getLicenseColor(model.license)
            )}
          >
            {model.license}
          </span>
          {model.source && (
            <span
              className={cn(
                "rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                getSourceColor(model.source)
              )}
            >
              {model.source === "epoch" ? "Epoch" : "Curated"}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed line-clamp-3 text-neutral-500 dark:text-neutral-400">
          {model.desc}
        </p>

        {/* Metadata (from Epoch.ai or other enriched sources) */}
        {(model.domain ||
          model.link ||
          model.trainingCompute ||
          model.trainingHardware ||
          model.authors) && (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-neutral-200 dark:border-white/10 pt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
            {model.domain && (
              <span>
                {model.link ? (
                  <a
                    href={model.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
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
                className="underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
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
  const router = useRouter();

  // Memoize related models to avoid recomputation on every render.
  // NOTE: This creates O(n²) complexity across all model cards (200 cards × 200 models).
  // Consider precomputing related models at build time if performance becomes an issue.
  // models is a stable import, excluded from deps to avoid unnecessary recomputation.
  const relatedModels = useMemo(() => {
    return getRelatedModels(model, models, MODEL_CARD_RELATED_MODELS_LIMIT);
  }, [model]); // eslint-disable-line react-hooks/exhaustive-deps

  if (relatedModels.length === 0) {
    return null;
  }

  const handleCompareAll = () => {
    const modelSlugs = relatedModels.map((m) => slugify(m.name));
    const url = `/compare?models=${modelSlugs.join(",")}`;
    router.push(url);
  };

  return (
    <div className="mt-3 border-t border-neutral-200 dark:border-white/10 pt-2">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 transition-all hover:text-neutral-900 dark:hover:text-neutral-200"
        >
          {isExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
          <span>Related Models ({relatedModels.length})</span>
        </button>

        <button
          onClick={handleCompareAll}
          className={cn(
            "rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs",
            "dark:border-white/10 dark:bg-white/5",
            "text-neutral-600 dark:text-neutral-400 transition-colors",
            "hover:border-neutral-300 dark:hover:border-white/20 hover:text-neutral-900 dark:hover:text-neutral-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
            "dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
          )}
        >
          Compare All
        </button>
      </div>

      {isExpanded && (
        <div className="mt-2 flex flex-col gap-1.5">
          {relatedModels.map((related) => (
            <a
              key={related.name}
              href={`#${related.name}`}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-neutral-50 dark:hover:bg-white/5"
              title={related.desc}
            >
              <OrgAvatar org={related.org} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-neutral-900 dark:text-neutral-100">
                  {related.name}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-neutral-500 dark:text-neutral-400">
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
              <Link2 className="h-3 w-3 shrink-0 text-neutral-500 dark:text-neutral-400" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
