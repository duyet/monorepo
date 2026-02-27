"use client";

import { Button } from "@duyet/components";
import { Menu, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatTopBarProps {
  onToggleSidebar: () => void;
  onToggleActivity: () => void;
  showActivityButton: boolean;
  activityCount: number;
}

export function ChatTopBar({
  onToggleSidebar,
  onToggleActivity,
  showActivityButton,
  activityCount,
}: ChatTopBarProps) {
  return (
    <div className="flex h-12 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-3">
      {/* Left: hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onToggleSidebar}
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      {/* Center: bot identity */}
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
          <span className="text-primary-foreground text-[10px] font-bold font-[family-name:var(--font-serif)]">
            D
          </span>
        </div>
        <span className="text-sm font-medium">@duyetbot</span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span className="text-xs text-muted-foreground hidden sm:inline">
          online
        </span>
      </div>

      {/* Right: activity toggle */}
      {showActivityButton ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative"
          onClick={onToggleActivity}
        >
          <Activity className="h-4 w-4" />
          {activityCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activityCount > 9 ? "9+" : activityCount}
            </span>
          )}
          <span className="sr-only">Toggle activity</span>
        </Button>
      ) : (
        <div className="w-8" />
      )}
    </div>
  );
}
