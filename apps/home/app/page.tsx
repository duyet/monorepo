import { AiContentCard, ContentCard, LinkCard } from "@duyet/components";
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

type AppLinkCardProps = {
  title: string;
  href: string;
  description: string;
  icon: React.ReactNode;
};

function AppLinkCard({ title, href, description, icon }: AppLinkCardProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-1 items-center gap-3 px-5 py-4 transition-colors hover:bg-neutral-50"
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-colors group-hover:bg-neutral-200">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <p className="truncate text-xs text-neutral-500">{description}</p>
      </div>
    </Link>
  );
}

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
          <div className="flex flex-col divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white sm:flex-row sm:divide-x sm:divide-y-0">
            <AppLinkCard
              title="OpenClaw"
              href={addUtmParams(
                "https://claw.duyet.net",
                "homepage",
                "claw_compact"
              )}
              description="Mission Control"
              icon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="9" height="9" rx="1" />
                  <rect x="13" y="2" width="9" height="9" rx="1" />
                  <rect x="2" y="13" width="9" height="9" rx="1" />
                  <rect x="13" y="13" width="9" height="9" rx="1" />
                </svg>
              }
            />

            <AppLinkCard
              title="LLM Timeline"
              href={addUtmParams(
                process.env.NEXT_PUBLIC_DUYET_LLM_TIMELINE_URL ||
                  "https://llm-timeline.duyet.net",
                "homepage",
                "llm_timeline_compact"
              )}
              description="History of LLM releases"
              icon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                  <circle cx="9" cy="6" r="2" fill="currentColor" stroke="none" />
                  <circle
                    cx="15"
                    cy="12"
                    r="2"
                    fill="currentColor"
                    stroke="none"
                  />
                  <circle cx="7" cy="18" r="2" fill="currentColor" stroke="none" />
                </svg>
              }
            />

            <AppLinkCard
              title="AI Agents"
              href={addUtmParams(
                process.env.NEXT_PUBLIC_DUYET_AGENTS_URL ||
                  "https://agents.duyet.net",
                "homepage",
                "agents_compact"
              )}
              description="Chat with @duyetbot"
              icon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
                  <circle
                    cx="12"
                    cy="10"
                    r="1"
                    fill="currentColor"
                    stroke="none"
                  />
                  <circle
                    cx="15"
                    cy="10"
                    r="1"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              }
            />

            <AppLinkCard
              title="Homelab"
              href={addUtmParams(
                process.env.NEXT_PUBLIC_DUYET_HOMELAB_URL ||
                  "https://homelab.duyet.net",
                "homepage",
                "homelab_compact"
              )}
              description="Infrastructure monitoring"
              icon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="3" width="20" height="5" rx="1" />
                  <rect x="2" y="11" width="20" height="5" rx="1" />
                  <rect x="2" y="19" width="20" height="2" rx="1" />
                  <circle cx="6" cy="5.5" r="1" fill="currentColor" stroke="none" />
                  <circle
                    cx="6"
                    cy="13.5"
                    r="1"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              }
            />
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
