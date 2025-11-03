/**
 * UI Configuration
 *
 * Centralized configuration for UI constants, periods, navigation, and themes.
 * Used across all apps in the monorepo for consistent UI behavior.
 */

// Period Configuration (for Insights app)
export type PeriodValue = "7" | "30" | "365" | "all";
export type PeriodDays = 7 | 30 | 365 | "all";

export interface PeriodConfig {
  value: PeriodValue;
  label: string;
  days: PeriodDays;
  description?: string;
}

export const PERIODS: PeriodConfig[] = [
  {
    value: "7",
    label: "7 days",
    days: 7,
    description: "Last week",
  },
  {
    value: "30",
    label: "30 days",
    days: 30,
    description: "Last month",
  },
  {
    value: "365",
    label: "12 months",
    days: 365,
    description: "Last year",
  },
  {
    value: "all",
    label: "All",
    days: "all",
    description: "All time",
  },
];

export const DEFAULT_PERIOD: PeriodValue = "30";

// Period helper functions
export function getPeriodConfig(value: string): PeriodConfig {
  return (
    PERIODS.find((p) => p.value === value) ||
    PERIODS.find((p) => p.value === DEFAULT_PERIOD)!
  );
}

export function getPeriodDays(value: string): PeriodDays {
  return getPeriodConfig(value).days;
}

export function isPeriodValue(value: string): value is PeriodValue {
  return PERIODS.some((p) => p.value === value);
}

export function getAllPeriodValues(): PeriodValue[] {
  return PERIODS.map((p) => p.value);
}

export function generatePeriodStaticParams() {
  return PERIODS.map((p) => ({ period: p.value }));
}

// Theme Configuration
export const themeConfig = {
  default: "system" as "light" | "dark" | "system",
  colors: {
    light: {
      background: "#ffffff",
      foreground: "#000000",
    },
    dark: {
      background: "#000000",
      foreground: "#ffffff",
    },
  },
  transition: {
    duration: "1000ms",
    easing: "ease-in-out",
  },
};

// Navigation Configuration (Insights app)
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  description?: string;
}

export const insightsNavigation: NavItem[] = [
  {
    label: "Overview",
    href: "/",
    description: "Dashboard overview",
  },
  {
    label: "GitHub",
    href: "/github",
    description: "GitHub activity and repositories",
  },
  {
    label: "Blog",
    href: "/blog",
    description: "Blog analytics",
  },
  {
    label: "WakaTime",
    href: "/wakatime",
    description: "Coding time tracking",
  },
  {
    label: "AI Usage",
    href: "/ai",
    description: "Claude Code usage analytics",
  },
];

// Static Generation Configuration
export const staticConfig = {
  revalidate: 3600, // 1 hour default
  dynamic: "force-static" as const,
};

// Layout Configuration
export const layoutConfig = {
  container: {
    maxWidth: "1200px",
    padding: {
      mobile: "1rem",
      desktop: "2rem",
    },
  },
  spacing: {
    section: "2rem",
    component: "1rem",
  },
};

// Animation Configuration
export const animationConfig = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },
};

// Export all UI configs
export const uiConfig = {
  periods: {
    values: PERIODS,
    default: DEFAULT_PERIOD,
    helpers: {
      getPeriodConfig,
      getPeriodDays,
      isPeriodValue,
      getAllPeriodValues,
      generatePeriodStaticParams,
    },
  },
  theme: themeConfig,
  navigation: {
    insights: insightsNavigation,
  },
  static: staticConfig,
  layout: layoutConfig,
  animation: animationConfig,
};
