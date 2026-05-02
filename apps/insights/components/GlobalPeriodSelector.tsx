"use client";

import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@duyet/libs";
import { DEFAULT_PERIOD, PERIODS, type PeriodValue } from "@/lib/periods";

const validTabs = ["blog", "github", "wakatime", "ai"] as const;
type AnalyticsTab = (typeof validTabs)[number];

function isAnalyticsTab(tab: string): tab is AnalyticsTab {
  return validTabs.includes(tab as AnalyticsTab);
}

function getPeriodRoute(tab: AnalyticsTab) {
  switch (tab) {
    case "blog":
      return "/blog/$period";
    case "github":
      return "/github/$period";
    case "wakatime":
      return "/wakatime/$period";
    case "ai":
      return "/ai/$period";
  }
}

export function GlobalPeriodSelector() {
  const location = useRouterState({ select: (s) => s.location });
  const pathname = location.pathname;

  // Extract current tab and period from pathname
  // Patterns: /blog, /blog/30, /github, /github/7, etc.
  const segments = pathname.split("/").filter(Boolean);
  const currentTab = segments[0] || "";
  const currentPeriod = (segments[1] || DEFAULT_PERIOD) as PeriodValue;

  // Only show on analytics tabs
  if (!isAnalyticsTab(currentTab)) {
    return null;
  }

  const route = getPeriodRoute(currentTab);

  return (
    <div className="inline-flex items-center rounded-lg bg-muted p-1 text-muted-foreground">
      {PERIODS.map((period) => {
        const isActive = currentPeriod === period.value;

        return (
          <Link
            key={period.value}
            className={cn(
              "inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors",
              "hover:text-foreground",
              isActive && "bg-background text-foreground shadow-2xs"
            )}
            params={{ period: period.value }}
            to={route}
          >
            {period.label}
          </Link>
        );
      })}
    </div>
  );
}
