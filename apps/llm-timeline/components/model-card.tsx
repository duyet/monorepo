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
              isSelected
                ? "bg-[var(--accent)] border-[var(--accent)]"
                : "bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--accent)]"
            )}
            aria-label={
              isSelected
                ? `Deselect ${model.name}`
                : `Select ${model.name} for comparison`
            }
          >
            {isSelected && <Check className="h-3 w-3 text-white" />}
          </button>
        )}

        {/* Small dot indicator */}
        {!isSelectable && (
          <div
            className="shrink-0"
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor:
                model.type === "milestone" ? "var(--accent)" : "var(--border)",
            }}
          />
        )}

        {/* Model name on left */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <OrgAvatar org={model.org} size="sm" />
          <span
            className="truncate text-sm font-medium"
            style={{ color: "var(--text)" }}
          >
            {model.name}
          </span>
        </div>

        {/* Dots separator */}
        <div
          className="flex-1 px-2"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--border) 1px, transparent 1px)",
            backgroundSize: "4px 4px",
            backgroundRepeat: "repeat-x",
            backgroundPosition: "center",
            opacity: 0.4,
          }}
        />

        {/* Year and metadata on right */}
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="text-xs"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
            }}
          >
            {model.date.slice(0, 4)}
          </span>
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              getTypeColor(model.type)
            )}
          >
            {model.type}
          </span>
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              getLicenseColor(model.license)
            )}
          >
            {model.license}
          </span>
          {model.source && (
            <span
              className={cn(
                "rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
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
        <div
          className="absolute left-[13px] top-0 h-full w-px"
          style={{ backgroundColor: "var(--border)" }}
        />
      )}

      {/* Org logo as timeline dot or selection checkbox */}
      {isSelectable ? (
        <div
          className="relative z-10 shrink-0"
          style={{ backgroundColor: "var(--background)" }}
        >
          <button
            onClick={() => onSelectionChange?.(!isSelected)}
            className={cn(
              "flex items-center justify-center transition-all rounded-lg p-1",
              isSelected
                ? "bg-[var(--accent)]"
                : "bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)]"
            )}
            aria-label={
              isSelected
                ? `Deselect ${model.name}`
                : `Select ${model.name} for comparison`
            }
          >
            {isSelected ? (
              <Check className="h-5 w-5 text-white" />
            ) : (
              <OrgAvatar org={model.org} size="sm" />
            )}
          </button>
        </div>
      ) : (
        <div
          className="relative z-10 shrink-0 rounded-lg p-1"
          style={{ backgroundColor: "var(--background)" }}
        >
          <OrgAvatar org={model.org} size="sm" />
        </div>
      )}

      {/* Card */}
      <div
        className={cn(
          "flex-1 rounded-lg border p-4 transition-colors",
          isSelectable &&
            isSelected &&
            "ring-2 ring-[var(--accent)] ring-offset-2"
        )}
        style={{
          borderColor: isSelected ? "var(--accent)" : "var(--border)",
          backgroundColor: "var(--bg-card)",
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            (e.currentTarget as HTMLDivElement).style.backgroundColor =
              "var(--bg-card-hover)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            (e.currentTarget as HTMLDivElement).style.backgroundColor =
              "var(--bg-card)";
          }
        }}
      >
        {/* Header row */}
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3
              className="text-base font-semibold truncate"
              style={{ color: "var(--text)", fontFamily: "var(--font-sans)" }}
            >
              {model.name}
            </h3>
            <p
              className="text-xs truncate"
              style={{ color: "var(--text-muted)" }}
            >
              {model.org}
            </p>
          </div>

          {/* Date + params */}
          <div className="text-right">
            <div
              className="text-xs"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
              }}
            >
              {model.date.slice(0, 7)}
            </div>
            {model.params && (
              <div
                className="text-xs"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-muted)",
                }}
              >
                {model.params}
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="mb-2 flex gap-1.5">
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              getTypeColor(model.type)
            )}
          >
            {model.type}
          </span>
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              getLicenseColor(model.license)
            )}
          >
            {model.license}
          </span>
          {model.source && (
            <span
              className={cn(
                "rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                getSourceColor(model.source)
              )}
            >
              {model.source === "epoch" ? "Epoch" : "Curated"}
            </span>
          )}
        </div>

        {/* Description */}
        <p
          className="text-sm leading-relaxed line-clamp-3"
          style={{ color: "var(--text-muted)" }}
        >
          {model.desc}
        </p>

        {/* Metadata (from Epoch.ai or other enriched sources) */}
        {(model.domain ||
          model.link ||
          model.trainingCompute ||
          model.trainingHardware ||
          model.authors) && (
          <div
            className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t pt-2 text-[11px]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            {model.domain && (
              <span>
                {model.link ? (
                  <a
                    href={model.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-dotted hover:opacity-80"
                    style={{ color: "var(--accent)" }}
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
                className="underline decoration-dotted hover:opacity-80"
                style={{ color: "var(--accent)" }}
              >
                Paper
              </a>
            )}
            {model.trainingCompute && (
              <span style={{ fontFamily: "var(--font-mono)" }}>
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
    <div
      className="mt-3 border-t pt-2"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-[11px] font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--accent)" }}
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
          className="text-[11px] font-medium px-2 py-1 rounded transition-colors hover:opacity-80"
          style={{
            color: "var(--accent)",
            backgroundColor: "var(--bg)",
            border: "1px solid var(--border)",
          }}
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
              className="flex items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title={related.desc}
            >
              <OrgAvatar org={related.org} size="sm" />
              <div className="min-w-0 flex-1">
                <div
                  className="truncate text-xs font-medium"
                  style={{ color: "var(--text)" }}
                >
                  {related.name}
                </div>
                <div
                  className="flex items-center gap-2 text-[10px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span>{related.org}</span>
                  {related.params && (
                    <>
                      <span>·</span>
                      <span style={{ fontFamily: "var(--font-mono)" }}>
                        {related.params}
                      </span>
                    </>
                  )}
                  <span>·</span>
                  <span>{related.date.slice(0, 4)}</span>
                </div>
              </div>
              <Link2
                className="h-3 w-3 shrink-0"
                style={{ color: "var(--text-muted)" }}
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
