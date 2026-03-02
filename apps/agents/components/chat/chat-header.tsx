"use client";

import { Wrench, Zap } from "lucide-react";
import type { ChatMode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  mode?: ChatMode;
  onModeChange?: (mode: ChatMode) => void;
}

export function ChatHeader({
  title = "@duyetbot",
  subtitle = "Virtual version of Duyet",
  mode,
  onModeChange,
}: ChatHeaderProps) {
  return (
    <div className="border-b bg-background">
      <div className="flex h-12 items-center justify-between px-4">
        {/* Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary shrink-0">
            <span className="text-primary-foreground text-xs font-bold leading-none font-[family-name:var(--font-serif)]">
              D
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-bold font-[family-name:var(--font-serif)] tracking-tight truncate">
              {title}
            </span>
            <span className="hidden sm:inline text-xs text-muted-foreground truncate">
              {subtitle}
            </span>
          </div>
          {/* Online indicator */}
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
        </div>

        {/* Mode toggle */}
        {onModeChange && (
          <div className="flex items-center rounded-full bg-muted/60 p-1 gap-1 shrink-0 shadow-inner">
            <button
              type="button"
              onClick={() => onModeChange("fast")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300",
                mode === "fast"
                  ? "bg-stone-50 text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-50"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Zap
                className={cn(
                  "h-3.5 w-3.5",
                  mode === "fast" && "text-amber-500"
                )}
              />
              Fast
            </button>
            <button
              type="button"
              onClick={() => onModeChange("agent")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300",
                mode === "agent"
                  ? "bg-stone-50 text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-50"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Wrench
                className={cn(
                  "h-3.5 w-3.5",
                  mode === "agent" && "text-blue-500"
                )}
              />
              Agent
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
