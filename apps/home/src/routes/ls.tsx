import { ogMeta } from "@duyet/config/og";
import { createFileRoute } from "@tanstack/react-router";
import {
  CATEGORY_MAP,
  CATEGORY_ORDER,
  DEFAULT_CATEGORY,
} from "../../app/config/categories";
import { urls } from "../../app/config/urls";
import UrlsList from "../components/UrlsList";
import {
  SITE_DESCRIPTION,
  SITE_OG_IMAGE,
  SITE_OG_IMAGE_ALT,
  SITE_TITLE,
  SITE_URL,
} from "../lib/og";

export const Route = createFileRoute("/ls")({
  component: ListPage,
  head: () => ({
    // /ls sets no title or description of its own, so both are inherited from
    // the root route. Repeating them here lets this page carry its own
    // `og:url` without changing what it renders.
    meta: [
      ...ogMeta({
        url: `${SITE_URL}/ls`,
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        image: SITE_OG_IMAGE,
        imageAlt: SITE_OG_IMAGE_ALT,
      }),
    ],
    links: [{ rel: "canonical", href: "https://duyet.net/ls" }],
  }),
});

const publicUrls = Object.entries(urls)
  .filter(([_, value]) => {
    if (typeof value === "string") return true;
    return !value.system;
  })
  .map(([path, value]) => ({
    path,
    target: typeof value === "string" ? value : value.target,
    desc: typeof value === "string" ? undefined : value.desc,
    category: CATEGORY_MAP[path] ?? DEFAULT_CATEGORY,
  }))
  .sort((a, b) => {
    const aIdx = CATEGORY_ORDER.indexOf(a.category);
    const bIdx = CATEGORY_ORDER.indexOf(b.category);
    const catDiff = (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
    if (catDiff !== 0) return catDiff;
    return a.path.localeCompare(b.path);
  });

function ListPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-[1200px] px-6 pt-24 pb-20 md:px-8 md:pt-32 md:pb-32">
        <header className="max-w-3xl">
          <div className="flex items-baseline gap-4">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Short URLs
            </h1>
            <span className="font-mono text-sm tabular-nums text-muted-foreground">
              {publicUrls.length}
            </span>
          </div>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Quick links and redirects for duyet.net.
          </p>
        </header>

        <div className="mt-16">
          <UrlsList urls={publicUrls} />
        </div>
      </main>
    </div>
  );
}
