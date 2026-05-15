import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
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
    summary: "A practical gateway for routing model traffic across providers.",
    image: "/screenshots/anyrouter-art.svg",
    url: "https://github.com/duyet/anyrouter",
    year: "2026",
    role: "Design, engineering, docs",
    industry: "AI infrastructure",
    overview:
      "AnyRouter turns provider choice, model routing, and integration docs into a single focused surface for developers building AI products.",
    highlights: [
      "Provider-agnostic API patterns for LLM applications.",
      "Developer-facing docs designed for copy-paste integration.",
      "Operational pages for models, usage, and gateway behavior.",
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main className="relative z-10 bg-[var(--background)] pb-16">
        <section className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 md:py-16 lg:px-10">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
          <div className="space-y-4 md:space-y-6 lg:space-y-8">
            <p className="text-sm font-medium text-[var(--muted-foreground)]">
              {product.eyebrow}
            </p>
            <h1 className="text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>
            <p className="max-w-[580px] text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
              {product.summary}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
          <img
            src={product.image}
            alt={`${product.name} product screenshot`}
            className="aspect-[4/3] w-full bg-[#050505] object-cover sm:aspect-[6/4] lg:aspect-[5/3]"
          />
        </section>

        <section className="mx-auto mt-14 max-w-[1180px] px-5 sm:px-8 lg:px-10">
          <div className="space-y-4 lg:space-y-6">
            <h2 className="text-lg font-semibold">About {product.name}</h2>
            <p className="max-w-[900px] text-xl font-semibold leading-snug sm:text-2xl md:text-3xl">
              {product.overview}
            </p>
          </div>

          <div className="my-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Meta label="Product" value={product.name} />
            <Meta label="Industry" value={product.industry} />
            <Meta label="Role" value={product.role} />
            <Meta label="Year" value={product.year} />
          </div>

          <div className="space-y-4 lg:space-y-6">
            <h2 className="text-lg font-semibold">Highlights</h2>
            <div className="border-y border-[var(--hairline)]">
              {product.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="border-t border-[var(--hairline)] py-4 first:border-t-0"
                >
                  <p className="text-sm font-medium leading-6 md:text-base">
                    {highlight}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="my-10 flex justify-start">
            <a
              href={addUtmParams(
                product.url,
                "homepage",
                `${product.slug}_product_page`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-[var(--background)] transition-colors hover:bg-[var(--foreground)]/80"
            >
              Visit project
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-[1180px] px-5 sm:px-8 lg:px-10">
          <h2 className="text-2xl font-semibold md:text-3xl">
            More projects
          </h2>
          <div className="mt-6 border-y border-[var(--hairline)]">
            {related.map((item) => (
              <Link
                key={item.slug}
                to="/p/$project"
                params={{ project: item.slug }}
                className="group grid gap-4 border-t border-[var(--hairline)] py-5 text-[var(--foreground)] first:border-t-0 hover:text-[var(--muted-foreground)] sm:grid-cols-[180px_1fr] sm:items-center"
              >
                <img
                  src={item.image}
                  alt=""
                  className="aspect-[16/9] w-full bg-[#050505] object-cover object-top"
                />
                <div>
                  <p className="text-lg font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {item.eyebrow}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-[var(--border)] pt-3">
      <h3 className="text-sm text-[var(--muted-foreground)] lg:text-base">
        {label}
      </h3>
      <p className="mt-1 text-base font-semibold lg:text-lg">{value}</p>
    </div>
  );
}
