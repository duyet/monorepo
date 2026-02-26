import {
  AiContentCard,
  AppCard,
  ContentCard,
  LinkCard,
} from "@duyet/components";
import Link from "next/link";

export const dynamic = "force-static";
export const revalidate = 3600;

// Build date for resume card
const buildDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

/**
 * Add UTM tracking parameters to URL
 */
function addUtmParams(
  url: string,
  campaign = "homepage",
  content?: string
): string {
  // Don't add UTM params to internal routes
  if (url.startsWith("/")) return url;

  const urlObj = new URL(url);
  urlObj.searchParams.set("utm_source", "home");
  urlObj.searchParams.set("utm_medium", "website");
  urlObj.searchParams.set("utm_campaign", campaign);
  if (content) {
    urlObj.searchParams.set("utm_content", content);
  }
  return urlObj.toString();
}

interface AppItem {
  name: string;
  href: string;
  utmContent: string;
  screenshot: string;
}

const apps: AppItem[] = [
  {
    name: "LLM Timeline",
    href:
      process.env.NEXT_PUBLIC_DUYET_LLM_TIMELINE_URL ||
      "https://llm-timeline.duyet.net",
    utmContent: "llm_timeline_bento",
    screenshot: "/screenshots/llm-timeline.png",
  },
  {
    name: "OpenClaw",
    href: "https://claw.duyet.net",
    utmContent: "claw_bento",
    screenshot: "/screenshots/openclaw.png",
  },
  {
    name: "AI Agents",
    href:
      process.env.NEXT_PUBLIC_DUYET_AGENTS_URL || "https://agents.duyet.net",
    utmContent: "agents_bento",
    screenshot: "/screenshots/ai-agents.png",
  },
  {
    name: "CH Monitor",
    href: "https://clickhouse-monitor.duyet.workers.dev",
    utmContent: "ch_monitor_bento",
    screenshot: "/screenshots/ch-monitor.png",
  },
  {
    name: "Homelab",
    href:
      process.env.NEXT_PUBLIC_DUYET_HOMELAB_URL || "https://homelab.duyet.net",
    utmContent: "homelab_bento",
    screenshot: "/screenshots/homelab.png",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center bg-neutral-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 text-center sm:mb-12">
          <h1 className="mb-4 font-serif text-5xl font-normal text-neutral-900 sm:text-6xl">
            Duyet
          </h1>
          <p className="text-base leading-relaxed text-neutral-700 sm:text-lg">
            Data Engineering
          </p>
        </div>

        {/* Links Grid */}
        <div className="mb-8 grid gap-3 sm:mb-12 sm:grid-cols-2 lg:grid-cols-3">
          <AiContentCard
            title="Blog"
            href={addUtmParams(
              process.env.NEXT_PUBLIC_DUYET_BLOG_URL ||
                "https://blog.duyet.net",
              "homepage",
              "blog_card"
            )}
            fallbackDescription="Technical writings on data engineering, distributed systems, and open source."
            color="terracotta"
            illustration="blob"
            featured
            cardType="blog"
          />

          <ContentCard
            title="Resume"
            href={addUtmParams(
              process.env.NEXT_PUBLIC_DUYET_CV_URL || "https://cv.duyet.net",
              "homepage",
              "resume_card"
            )}
            category={`Updated ${buildDate}`}
            description="Experience building scalable data infrastructure and leading engineering teams."
            color="oat"
            illustration="wavy"
          />

          <ContentCard
            title="Insights"
            href={addUtmParams(
              process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL ||
                "https://insights.duyet.net",
              "homepage",
              "insights_card"
            )}
            description="Analytics dashboard showcasing data from GitHub, WakaTime, and more."
            color="cactus"
            tags={["Coding Stats", "Website Traffic", "LLM Token Usage"]}
            illustration="wavy"
          />

          <LinkCard
            title="Photos"
            href={addUtmParams(
              process.env.NEXT_PUBLIC_DUYET_PHOTOS_URL ||
                "https://photos.duyet.net",
              "homepage",
              "photos_card"
            )}
            description="Photography portfolio and visual stories from travels and daily life."
            color="cream"
            backgroundImage="https://images.unsplash.com/photo-1760809974561-545e45bea13e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=872"
          />

          <LinkCard
            title="About"
            href="/about"
            description="Learn more about my experience, skills, and professional background."
            color="ivory"
            illustration="geometric"
          />
        </div>

        {/* Apps Section */}
        <div className="mb-8 sm:mb-12">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400">
            Apps
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((item) => (
              <AppCard
                key={item.utmContent}
                title={item.name}
                href={addUtmParams(item.href, "homepage", item.utmContent)}
                screenshot={item.screenshot}
              />
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-neutral-600 sm:gap-10">
          <Link
            href={addUtmParams(
              "https://github.com/duyet",
              "homepage",
              "footer_github"
            )}
            target="_blank"
            className="transition-colors duration-200 hover:text-neutral-900"
          >
            GitHub
          </Link>
          <Link
            href={addUtmParams(
              "https://linkedin.com/in/duyet",
              "homepage",
              "footer_linkedin"
            )}
            target="_blank"
            className="transition-colors duration-200 hover:text-neutral-900"
          >
            LinkedIn
          </Link>
          <Link
            href="/ls"
            className="transition-colors duration-200 hover:text-neutral-900"
          >
            Short URLs
          </Link>
          <a
            href="/llms.txt"
            className="transition-colors duration-200 hover:text-neutral-900"
          >
            llms.txt
          </a>
          <Link
            href={addUtmParams(
              "https://status.duyet.net",
              "homepage",
              "footer_status"
            )}
            target="_blank"
            className="transition-colors duration-200 hover:text-neutral-900"
          >
            Status
          </Link>
        </div>
      </div>
    </div>
  );
}
