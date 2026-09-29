/**
 * The product pages behind `/p/$project`.
 *
 * Lives in its own module (rather than inline in the route) because three
 * consumers need it: the route itself, the build-time OG card generator in
 * `scripts/generate-og.ts`, and `vite.config.ts`'s prerender list. Keeping one
 * array means a new product can't be added without also getting a card and a
 * prerendered page — see `__tests__/og-meta.test.ts`, which enforces that.
 */

export type Product = {
  slug: string;
  name: string;
  eyebrow: string;
  summary: string;
  /**
   * Public-path screenshot used for the product's on-page hero *and* as the
   * source image that gets dithered into its `/og/p/<slug>.png` card.
   */
  image: string;
  url: string;
  year: string;
  role: string;
  industry: string;
  overview: string;
  highlights: string[];
};

export const products: Product[] = [
  {
    slug: "anyrouter",
    name: "AnyRouter",
    eyebrow: "AI gateway product",
    summary: "One API for every AI model.",
    image: "/art/ascii-01.webp",
    url: "https://anyrouter.dev",
    year: "2026",
    role: "Design, engineering, docs",
    industry: "AI infrastructure",
    overview:
      "AnyRouter routes traffic across providers with fallback, observability, and BYOK from a single OpenAI-compatible endpoint built on Cloudflare's edge.",
    highlights: [
      "OpenAI-compatible API surface for model traffic.",
      "Provider routing with fallback behavior for resilient AI products.",
      "Observability and BYOK workflows for production teams.",
    ],
  },
  {
    slug: "chm",
    name: "ClickHouse Monitoring",
    eyebrow: "AI-assisted monitoring",
    summary:
      "A ClickHouse cluster monitoring surface with agent support for finding insights and triaging activity.",
    image: "/screenshots/ch-monitor.png",
    url: "https://chmonitor.dev",
    year: "2026",
    role: "Product design, frontend, observability",
    industry: "Data infrastructure",
    overview:
      "The monitoring app keeps cluster health, query activity, and operational signals in a compact interface, with AI agent support for finding insights and monitoring changes.",
    highlights: [
      "Dense but readable dashboards for ClickHouse operations.",
      "AI agent workflows for surfacing insights from cluster and query activity.",
      "Responsive layouts that keep metrics scannable on smaller screens.",
    ],
  },
  {
    slug: "stamp",
    name: "Stamp",
    eyebrow: "Link and image utility",
    summary: "A small product surface for links, generated visuals, and usage.",
    image: "/screenshots/stamp.png",
    url: "https://stamp.duyet.net",
    year: "2026",
    role: "Design, full-stack engineering",
    industry: "Developer tools",
    overview:
      "Stamp combines a compact public tool with operational details behind the scenes, keeping the product easy to understand and fast to use.",
    highlights: [
      "Simple public workflows with restrained controls.",
      "Usage and credit surfaces designed for clarity.",
      "Cloudflare-first deployment and configuration.",
    ],
  },
];

/** Route paths for every product page, for the prerender `pages[]` list. */
export const productPaths: string[] = products.map((p) => `/p/${p.slug}`);

export function findProduct(slug: string): Product | undefined {
  return products.find((item) => item.slug === slug);
}
