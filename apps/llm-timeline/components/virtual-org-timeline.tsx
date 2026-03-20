import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Model } from "@/lib/data";
import { ModelCard } from "./model-card";
import { OrgAvatar } from "./org-avatar";

interface VirtualOrgTimelineProps {
  modelsByOrg: Map<string, Model[]>;
  liteMode?: boolean;
}

interface VirtualItem {
  type: "group" | "model";
  key: string;
  org?: string;
  model?: Model;
  groupIndex?: number;
  modelCount?: number;
}

export function VirtualOrgTimeline({
  modelsByOrg,
  liteMode,
}: VirtualOrgTimelineProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(200); // Default offset

  // Calculate offset from top of page when container mounts
  useEffect(() => {
    if (parentRef.current) {
      const rect = parentRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setScrollMargin(rect.top + scrollTop);
    }
  }, []);

  const sortedOrgs = Array.from(modelsByOrg.keys());

  // Flatten grouped data into a list of virtual items
  const virtualItems = useMemo(() => {
    const items: VirtualItem[] = [];
    sortedOrgs.forEach((org) => {
      const orgModels = modelsByOrg.get(org) || [];
      items.push({
        type: "group",
        key: `group-${org}`,
        org,
        modelCount: orgModels.length,
      });
      orgModels.forEach((model) => {
        items.push({
          type: "model",
          key: `${model.org}-${model.date}-${model.name}`,
          model,
        });
      });
    });
    return items;
  }, [sortedOrgs, modelsByOrg]);

  if (virtualItems.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] p-8 text-center">
        <p className="text-neutral-500 dark:text-neutral-400">
          No models found matching your filters.
        </p>
      </div>
    );
  }

  const rowVirtualizer = useWindowVirtualizer({
    count: virtualItems.length,
    scrollMargin: scrollMargin, // Offset from top of page
    estimateSize: (index) => {
      const item = virtualItems[index];
      if (item.type === "group") return 100; // Org header height (includes avatar)
      return liteMode ? 100 : 180; // Model card height
    },
    overscan: 5,
  });

  return (
    <div className="rounded-lg">
      <div
        ref={parentRef}
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative",
          width: "100%",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = virtualItems[virtualRow.index];
          const isGroup = item.type === "group";

          if (isGroup) {
            const groupItem = item as VirtualItem & {
              type: "group";
              modelCount: number;
            };
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  padding: "0 1rem",
                }}
              >
                {/* Org Header */}
                <div className="mb-6 flex items-center gap-4 overflow-hidden">
                  <div className="shrink-0 overflow-hidden">
                    <span
                      className="select-none text-3xl font-bold leading-none block font-[family-name:var(--font-mono)] whitespace-nowrap text-neutral-200 dark:text-neutral-700"
                      aria-hidden="true"
                    >
                      {groupItem.org}
                    </span>
                  </div>
                  <div className="h-px flex-1 min-w-0 shrink bg-gradient-to-r from-neutral-200 dark:from-white/10 to-transparent" />
                  <div className="flex shrink-0 items-center gap-2">
                    <OrgAvatar org={groupItem.org!} size="sm" />
                    <span className="text-sm font-medium truncate max-w-[12rem] text-neutral-900 dark:text-neutral-100">
                      {groupItem.org}
                    </span>
                    <span className="text-xs uppercase tracking-widest font-[family-name:var(--font-mono)] text-neutral-500 dark:text-neutral-400">
                      {groupItem.modelCount} model
                      {groupItem.modelCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          // Model card
          const modelItem = item as VirtualItem & { type: "model" };
          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
                paddingLeft: "1rem",
                paddingRight: "1rem",
              }}
            >
              <ModelCard
                model={modelItem.model!}
                lite={liteMode}
                isLast={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
