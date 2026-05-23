"use client";

import { cn } from "@duyet/libs/utils";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
} from "lucide-react";

type CalloutVariant = "info" | "warning" | "error" | "success" | "tip";

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Callout - Highlighted information box with semantic variants
 * Inspired by HTML effectiveness pattern for explainer content
 */
export function Callout({
  variant = "info",
  title,
  children,
  className = "",
}: CalloutProps) {
  const variantStyles = {
    info: {
      container:
        "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800",
      icon: "text-blue-600 dark:text-blue-400",
      title: "text-blue-800 dark:text-blue-300",
      text: "text-blue-700 dark:text-blue-300",
      Icon: Info,
    },
    warning: {
      container:
        "bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800",
      icon: "text-yellow-600 dark:text-yellow-400",
      title: "text-yellow-800 dark:text-yellow-300",
      text: "text-yellow-700 dark:text-yellow-300",
      Icon: AlertTriangle,
    },
    error: {
      container:
        "bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800",
      icon: "text-red-600 dark:text-red-400",
      title: "text-red-800 dark:text-red-300",
      text: "text-red-700 dark:text-red-300",
      Icon: AlertCircle,
    },
    success: {
      container:
        "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800",
      icon: "text-green-600 dark:text-green-400",
      title: "text-green-800 dark:text-green-300",
      text: "text-green-700 dark:text-green-300",
      Icon: CheckCircle,
    },
    tip: {
      container: "bg-[var(--surface-card)] border-[var(--hairline)]",
      icon: "text-[var(--primary)]",
      title: "text-[var(--ink)] dark:text-[var(--on-dark)]",
      text: "text-[var(--body)]",
      Icon: Lightbulb,
    },
  };

  const styles = variantStyles[variant];
  const { Icon } = styles;

  return (
    <div
      className={cn(
        "my-6 rounded-lg border p-4 flex gap-3",
        styles.container,
        className
      )}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", styles.icon)} />
      <div className="flex-1 min-w-0">
        {title && (
          <h5 className={cn("font-semibold mb-1", styles.title)}>{title}</h5>
        )}
        <div className={cn("text-sm leading-relaxed", styles.text)}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Callout;
