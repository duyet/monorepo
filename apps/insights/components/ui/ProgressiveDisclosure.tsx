"use client";

import { cn } from "@duyet/libs";
import { ChevronDown, ChevronRight, Info, Settings } from "lucide-react";
import { type ReactNode, useState } from "react";

interface ProgressiveDisclosureProps {
  title: string;
  preview?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  variant?: "default" | "subtle" | "card";
  badge?: string;
  description?: string;
  icon?: ReactNode;
}

export function ProgressiveDisclosure({
  title,
  preview,
  children,
  defaultOpen = false,
  className,
  variant = "default",
  badge,
  description,
  icon,
}: ProgressiveDisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const variantStyles = {
    default: "border rounded-lg bg-card",
    subtle: "border-b",
    card: "border rounded-lg bg-card shadow-sm",
  };

  return (
    <div className={cn(variantStyles[variant], className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between p-4 text-left transition-colors",
          "hover:bg-accent/50",
          variant === "subtle" && "p-3 hover:bg-transparent"
        )}
      >
        <div className="flex min-w-0 flex-1 items-center space-x-3">
          {icon && <div className="shrink-0 text-muted-foreground">{icon}</div>}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h3
                className={cn(
                  "font-semibold",
                  variant === "subtle" ? "text-sm" : "text-base"
                )}
              >
                {title}
              </h3>
              {badge && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </p>
            )}
            {!isOpen && preview && (
              <div className="mt-2 text-sm text-muted-foreground">
                {preview}
              </div>
            )}
          </div>
        </div>
        <div className="shrink-0">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isOpen && (
        <div
          className={cn(
            "border-t p-4",
            variant === "subtle" && "border-t-0 px-3 pb-3"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  level?: 1 | 2 | 3;
}

export function CollapsibleSection({
  title,
  children,
  defaultExpanded = false,
  className,
  level = 1,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const titleSizes = {
    1: "text-lg font-semibold",
    2: "text-base font-semibold",
    3: "text-sm font-medium",
  };

  return (
    <div className={cn("space-y-3", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className={cn(titleSizes[level], "text-foreground")}>{title}</h3>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && <div className="space-y-4">{children}</div>}
    </div>
  );
}

interface AdvancedToggleProps {
  children: ReactNode;
  advancedContent: ReactNode;
  className?: string;
  label?: string;
}

export function AdvancedToggle({
  children,
  advancedContent,
  className,
  label = "Advanced Options",
}: AdvancedToggleProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className={cn("space-y-4", className)}>
      {children}

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center space-x-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Settings className="h-4 w-4" />
        <span>{label}</span>
        {showAdvanced ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </button>

      {showAdvanced && (
        <div className="bg-muted/30 rounded-lg border p-4">
          {advancedContent}
        </div>
      )}
    </div>
  );
}

interface InfoDisclosureProps {
  title: string;
  content: ReactNode;
  className?: string;
  variant?: "info" | "warning" | "tip";
}

export function InfoDisclosure({
  title,
  content,
  className,
  variant = "info",
}: InfoDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);

  const variantStyles = {
    info: "text-blue-600 dark:text-blue-400",
    warning: "text-amber-600 dark:text-amber-400",
    tip: "text-green-600 dark:text-green-400",
  };

  return (
    <div className={cn("rounded-lg border bg-card p-3", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center space-x-2 text-left"
      >
        <Info className={cn("h-4 w-4 shrink-0", variantStyles[variant])} />
        <span className="text-sm font-medium">{title}</span>
        <div className="flex-1" />
        {isOpen ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 pl-6 text-sm text-muted-foreground">{content}</div>
      )}
    </div>
  );
}
