/**
 * Application Configuration
 *
 * Centralized configuration for all apps in the monorepo.
 * Contains metadata, URLs, fonts, and other app-level settings.
 */

export interface AppMetadata {
  title: string;
  description: string;
  lang?: string;
}

export interface FontConfig {
  name: string;
  weights: readonly string[];
  subsets: readonly string[];
  variable: string;
  display: "auto" | "block" | "swap" | "fallback" | "optional";
}

export interface AppUrls {
  blog: string;
  cv: string;
  insights: string;
  home: string;
  photos: string;
  homelab: string;
}

// Environment-aware URL configuration
export const appUrls: AppUrls = {
  blog: process.env.NEXT_PUBLIC_DUYET_BLOG_URL || "https://blog.duyet.net",
  cv: process.env.NEXT_PUBLIC_DUYET_CV_URL || "https://cv.duyet.net",
  insights:
    process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL || "https://insights.duyet.net",
  home: process.env.NEXT_PUBLIC_DUYET_HOME_URL || "https://duyet.net",
  photos:
    process.env.NEXT_PUBLIC_DUYET_PHOTOS_URL || "https://photos.duyet.net",
  homelab:
    process.env.NEXT_PUBLIC_DUYET_HOMELAB_URL || "https://homelab.duyet.net",
};

// Blog app configuration
export const blogConfig = {
  metadata: {
    title: "Tôi là Duyệt",
    description: "Data Engineer. I blog about Data Engineering, Rust and more",
    lang: "en",
  } as AppMetadata,
  fonts: {
    inter: {
      name: "Inter",
      weights: ["400", "700"] as const,
      subsets: ["latin", "vietnamese"] as const,
      variable: "--font-inter",
      display: "swap",
    } as const,
    libreBaskerville: {
      name: "Libre Baskerville",
      weights: ["400", "700"] as const,
      subsets: ["latin", "latin-ext"] as const,
      variable: "--font-serif",
      display: "swap",
    } as const,
  },
  fontFamily:
    "var(--font-inter), -apple-system, BlinkMacSystemFont, ui-sans-serif, system-ui, sans-serif",
};

// Insights app configuration
export const insightsConfig = {
  metadata: {
    title: "Insights | duyet.net",
    description: "Insights for duyet.net",
    lang: "en",
  } as AppMetadata,
  fonts: {
    inter: {
      name: "Inter",
      weights: ["100", "200", "300", "400", "700"] as const,
      subsets: ["latin"] as const,
      variable: "--font-sans",
      display: "swap",
    } as const,
  },
  header: {
    longText: "Insights",
    shortText: "Insights",
  },
};

// CV app configuration
export const cvConfig = {
  metadata: {
    title: "Duyet Le - Résumé",
    description:
      "Data Engineer with 6+ years of experience in modern data warehousing, distributed systems, and cloud computing",
    lang: "en",
  } as AppMetadata,
  fonts: {
    inter: {
      name: "Inter",
      weights: ["400", "700"] as const,
      subsets: ["latin"] as const,
      variable: "--font-sans",
      display: "swap",
    } as const,
  },
};

// Home app configuration
export const homeConfig = {
  metadata: {
    title: "duyet.net",
    description: "Personal website and URL shortener",
    lang: "en",
  } as AppMetadata,
  fonts: {
    inter: {
      name: "Inter",
      weights: ["400", "700"] as const,
      subsets: ["latin"] as const,
      variable: "--font-sans",
      display: "swap",
    } as const,
  },
};

// Photos app configuration
export const photosConfig = {
  metadata: {
    title: "Photos | duyet.net",
    description: "Photography portfolio by Duyet Le",
    lang: "en",
  } as AppMetadata,
  fonts: {
    inter: {
      name: "Inter",
      weights: ["400", "500", "600", "700"] as const,
      subsets: ["latin"] as const,
      variable: "--font-sans",
      display: "swap",
    } as const,
  },
};

// Homelab app configuration
export const homelabConfig = {
  metadata: {
    title: "Homelab | duyet.net",
    description: "Homelab cluster monitoring dashboard - 3-node minipc cluster",
    lang: "en",
  } as AppMetadata,
  fonts: {
    inter: {
      name: "Inter",
      weights: ["100", "200", "300", "400", "700"] as const,
      subsets: ["latin"] as const,
      variable: "--font-sans",
      display: "swap",
    } as const,
  },
  header: {
    longText: "Homelab Dashboard",
    shortText: "Homelab",
  },
};

// Export all configs
export const appConfig = {
  urls: appUrls,
  blog: blogConfig,
  insights: insightsConfig,
  cv: cvConfig,
  home: homeConfig,
  photos: photosConfig,
  homelab: homelabConfig,
};
