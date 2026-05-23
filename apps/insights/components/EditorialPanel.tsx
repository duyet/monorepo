"use client";

import { cn } from "@duyet/libs";
import type { ReactNode } from "react";

interface EditorialPanelProps {
  /** Uppercase eyebrow label, e.g. `COMMITS · 30 DAYS`. */
  label: string;
  /** Hero number/value. Pre-formatted; will be rendered tabular-mono. */
  value: string;
  /** Optional subtle suffix shown to the right of the value (e.g. `tokens`). */
  unit?: string;
  /** Optional sparkline / small chart slot beneath the value. */
  sparkline?: ReactNode;
  /** Optional muted helper text below the value. */
  caption?: string;
  className?: string;
}

export function EditorialPanel({
  label,
  value,
  unit,
  sparkline,
  caption,
  className,
}: EditorialPanelProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-3 py-2",
        className
      )}
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="flex items-baseline gap-2">
        <span className="font-mono text-5xl tabular-nums tracking-tight text-[color:var(--foreground)] md:text-6xl">
          {value}
        </span>
        {unit ? (
          <span className="text-sm text-[color:var(--muted)]">{unit}</span>
        ) : null}
      </p>
      {sparkline ? (
        <div className="h-10 w-full text-[color:var(--subtle)]">{sparkline}</div>
      ) : null}
      {caption ? (
        <p className="text-xs leading-5 text-[color:var(--muted)]">{caption}</p>
      ) : null}
    </div>
  );
}
