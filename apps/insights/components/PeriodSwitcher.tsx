"use client";

import { cn } from "@duyet/libs";
import { Link } from "@tanstack/react-router";
import { Fragment } from "react";
import { PERIODS, type PeriodValue } from "@/lib/periods";

interface PeriodSwitcherProps {
  /** Active period value (matches PERIODS[].value). */
  current: PeriodValue | string;
  /** Route to link each segment to. Receives `period` param. */
  route:
    | "/blog/$period"
    | "/github/$period"
    | "/wakatime/$period"
    | "/ai/$period";
  /** Optional eyebrow text shown to the left of the segments. */
  eyebrow?: string;
  className?: string;
}

export function PeriodSwitcher({
  current,
  route,
  eyebrow,
  className,
}: PeriodSwitcherProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-3 gap-y-2 text-[13px]",
        className
      )}
    >
      {eyebrow ? (
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </span>
      ) : null}
      {PERIODS.map((period, index) => {
        const isActive = current === period.value;
        return (
          <Fragment key={period.value}>
            {index > 0 ? (
              <span aria-hidden="true" className="text-muted-foreground/40">
                &middot;
              </span>
            ) : null}
            <Link
              to={route}
              params={{ period: period.value }}
              className={cn(
                "relative transition-colors",
                isActive
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {period.label}
              {isActive ? (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 right-0 h-px bg-foreground"
                />
              ) : null}
            </Link>
          </Fragment>
        );
      })}
    </div>
  );
}
