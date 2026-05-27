import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { addUtmParams } from "../../../app/lib/utm";
import { Card, CardContent } from "../../components/ui/card";

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
    <div className="min-h-screen bg-background text-foreground">

      <main className="mx-auto max-w-2xl px-6 pt-24 pb-20 md:px-8 md:pt-32 md:pb-32">
        <Link
          to="/projects"
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
        >
          ← Projects
        </Link>

        <header className="mt-10">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
            {product.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {product.summary}
          </p>
        </header>

        <p className="mt-12 text-base leading-relaxed">
          {product.overview}
        </p>

        <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4 font-mono text-sm">
          <Meta label="Year" value={product.year} />
          <Meta label="Industry" value={product.industry} />
          <Meta label="Role" value={product.role} />
          <Meta label="Link" value={new URL(product.url).host} />
        </dl>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">Highlights</h2>
          <ul className="mt-4 flex flex-col gap-3 text-base leading-relaxed">
            {product.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-3 h-px w-4 shrink-0 bg-foreground"
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
            className="text-base font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            Visit {product.name} →
          </a>
        </div>

        {related.length > 0 && (
          <section className="mt-20 border-t pt-10">
            <h2 className="text-2xl font-semibold tracking-tight mb-6">
              More projects
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  to="/p/$project"
                  params={{ project: item.slug }}
                  className="block no-underline"
                >
                  <Card className="hover:border-foreground/30 transition-colors">
                    <CardContent className="pt-5">
                      <h3 className="font-semibold text-lg tracking-tight">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.eyebrow}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground uppercase tracking-[0.08em] text-[11px]">
        {label}
      </dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
