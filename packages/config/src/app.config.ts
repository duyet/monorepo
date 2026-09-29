/**
 * App-level metadata for apps that read it from here.
 *
 * ## Why this file is so small
 *
 * It used to hold curated `metadata`, `fonts` and `fontFamily` blocks for ten
 * apps plus an `appUrls` table, on the strength of its own docstring claiming to
 * be "centralized configuration for all apps in the monorepo". Nothing read
 * them. Measured: `@duyet/config/app` had **zero** importers, and of the eleven
 * exported values only `homelabConfig` had a consumer
 * (`apps/homelab/src/routes/__root.tsx`, via the barrel, and only its
 * `.metadata`). `FontConfig` and the local `AppUrls` had none at all — the
 * `AppUrls` that matters is `packages/urls/src/types.ts`, a different type that
 * shadows this name.
 *
 * So the unreachable values are gone rather than left to look load-bearing. Git
 * has them, and the recovery command is in `docs/ai/core-memory.md`.
 *
 * The pattern that made this work is `ogMetaFromConfig` in `./og`: an app opts
 * in by passing its metadata through it, which is what homelab does. Adding an
 * app here is only worth it if the app actually reads it back.
 */

export interface AppMetadata {
  title: string;
  description: string;
  lang?: string;
  openGraph?: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    images: Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
    locale: string;
    type: string;
  };
  twitter?: {
    card: string;
    title: string;
    description: string;
    images: string[];
    creator: string;
  };
  icons?: {
    icon: string;
    shortcut?: string;
    apple?: string;
  };
  manifest?: string;
}

// Homelab app configuration.
// The only entry here with a consumer: `apps/homelab/src/routes/__root.tsx`
// reads `.metadata` and hands it to `ogMetaFromConfig`.
export const homelabConfig = {
  metadata: {
    title: "Homelab | duyet.net",
    description:
      "MicroK8s cluster monitoring dashboard - Real-time metrics, service status, and network analytics for a 5-node heterogeneous homelab",
    lang: "en",
    openGraph: {
      title: "Homelab Dashboard | duyet.net",
      description:
        "MicroK8s cluster monitoring dashboard - Real-time metrics, service status, and network analytics",
      url: "https://homelab.duyet.net",
      siteName: "duyet.net",
      images: [
        {
          url: "https://homelab.duyet.net/og-image.svg",
          width: 1200,
          height: 630,
          alt: "Homelab Dashboard - MicroK8s Cluster Monitoring",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Homelab Dashboard | duyet.net",
      description:
        "MicroK8s cluster monitoring - Real-time metrics and service status",
      images: ["https://homelab.duyet.net/og-image.svg"],
      creator: "@duyetdev",
    },
    icons: {
      icon: "https://duyet.net/brand/logo.svg",
      shortcut: "https://duyet.net/brand/logo.svg",
      apple: "https://duyet.net/brand/logo-512.png",
    },
    manifest: "/manifest.json",
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
