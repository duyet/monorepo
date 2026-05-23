import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { addUtmParams } from "../../../app/lib/utm";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";

type Product = {
  slug: string;
  name: string;
  eyebrow: string;
  summary: string;
  image: string;
  url: string;
  year: string;
  role: string;
  industry: string;
  overview: string;
  highlights: string[];
};

const products: Product[] = [
  {
    slug: "anyrouter",
    name: "AnyRouter",
    eyebrow: "AI gateway product",
    summary: "One API for every AI model.",
    image: "/screenshots/anyrouter-art.svg",
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

export const Route = createFileRoute("/p/$project")({
  head: ({ params, loaderData }) => {
    const product =
      (loaderData as { product?: Product } | undefined)?.product ??
      products.find((item) => item.slug === params.project);

    return {
      meta: [
        { title: `${product?.name ?? "Project"} | Duyet Le` },
        {
          name: "description",
          content:
            product?.summary ??
            "A Duyet Le project surface for data, AI, and developer tools.",
        },
      ],
    };
  },
  loader: ({ params }) => {
    const product = products.find((item) => item.slug === params.project);
    if (!product) throw notFound();
    return { product };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const related = products.filter((item) => item.slug !== product.slug);

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-6 pt-24 pb-20 md:px-8 md:pt-32 md:pb-32">
        <Link
          to="/projects"
          className="link-underline text-sm text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
        >
          ← Projects
        </Link>

        <header className="mt-10">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-[color:var(--subtle)]">
            {product.eyebrow}
          </p>
          <h1 className="mt-3 font-serif text-5xl tracking-tight md:text-6xl">
            {product.name}
          </h1>
          <p className="mt-6 text-lg leading-7 text-[color:var(--muted)]">
            {product.summary}
          </p>
        </header>

        <p className="mt-12 text-base leading-7 text-[color:var(--foreground)]">
          {product.overview}
        </p>

        <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4 font-mono text-sm tabular-nums">
          <Meta label="Year" value={product.year} />
          <Meta label="Industry" value={product.industry} />
          <Meta label="Role" value={product.role} />
          <Meta label="Link" value={new URL(product.url).host} />
        </dl>

        <section className="mt-14">
          <h2 className="font-serif text-2xl tracking-tight">Highlights</h2>
          <ul className="mt-4 flex flex-col gap-3 text-base leading-7 text-[color:var(--foreground)]">
            {product.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-3 h-px w-4 shrink-0 bg-[color:var(--accent)]"
                />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10">
          <a
            href={addUtmParams(
              product.url,
              "homepage",
              `${product.slug}_product_page`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline text-base text-[color:var(--foreground)]"
          >
            Visit {product.name} →
          </a>
        </div>

        {related.length > 0 && (
          <section className="mt-20 border-t border-[color:var(--hairline)] pt-10">
            <h2 className="font-serif text-2xl tracking-tight">
              More projects
            </h2>
            <ul className="mt-4 flex flex-col">
              {related.map((item) => (
                <li key={item.slug} className="group py-4">
                  <Link
                    to="/p/$project"
                    params={{ project: item.slug }}
                    className="block no-underline"
                  >
                    <p className="font-serif text-xl tracking-tight text-[color:var(--foreground)] transition-transform duration-150 ease-out group-hover:-translate-y-px">
                      <span className="link-underline">{item.name}</span>
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      {item.eyebrow}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[color:var(--subtle)] uppercase tracking-[0.08em] text-[11px]">
        {label}
      </dt>
      <dd className="mt-1 text-[color:var(--foreground)]">{value}</dd>
    </div>
  );
}
