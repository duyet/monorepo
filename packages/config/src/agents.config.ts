/**
 * Agents App Configuration
 *
 * Configuration for agents.duyet.net - @duyetbot AI Chat
 */

import type { AppMetadata } from "./app.config";

export const agentsConfig = {
  metadata: {
    title: "@duyetbot | duyet.net",
    description: "Chat with @duyetbot - a virtual version of Duyet. Ask about blog, CV, GitHub activity, or analytics.",
    lang: "en",
    openGraph: {
      title: "@duyetbot | duyet.net",
      description: "Chat with @duyetbot - Duyet's AI virtual assistant. Get answers about blog posts, CV, GitHub, and analytics.",
      url: "https://agents.duyet.net",
      siteName: "duyet.net",
      images: [
        {
          url: "https://agents.duyet.net/og-image.png",
          width: 1200,
          height: 630,
          alt: "@duyetbot - AI Virtual Assistant",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "@duyetbot | duyet.net",
      description: "Chat with @duyetbot - Duyet's AI virtual assistant. Get answers about blog posts, CV, GitHub, and analytics.",
      images: ["https://agents.duyet.net/og-image.png"],
      creator: "@duyetdev",
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
      apple: "/favicon.svg",
    },
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
  header: {
    longText: "@duyetbot",
    shortText: "AI Chat",
  },
};
