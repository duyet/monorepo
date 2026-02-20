"use client";

import type { ChatMode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Zap, Wrench } from "lucide-react";

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
      <div className="flex h-11 items-center justify-between px-4">
        {/* Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-foreground shrink-0">
            <span className="text-background text-[11px] font-bold leading-none font-[family-name:var(--font-geist-mono)]">@</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold tracking-tight truncate">{title}</span>
            <span className="hidden sm:inline text-xs text-muted-foreground truncate">{subtitle}</span>
          </div>
          {/* Online indicator */}
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
        </div>

        {/* Mode toggle */}
        {onModeChange && (
          <div className="flex items-center rounded-md border bg-muted/40 p-0.5 gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => onModeChange("fast")}
              className={cn(
                "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all duration-150",
                mode === "fast"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Zap className="h-3 w-3" />
              Fast
            </button>
            <button
              type="button"
              onClick={() => onModeChange("agent")}
              className={cn(
                "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all duration-150",
                mode === "agent"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Wrench className="h-3 w-3" />
              Agent
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
