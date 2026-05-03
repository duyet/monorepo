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
    eyebrow: "Operational dashboard",
    summary: "A ClickHouse cluster monitoring surface for fast daily triage.",
    image: "/screenshots/ch-monitor.png",
    url: "https://clickhouse.duyet.net",
    year: "2026",
    role: "Product design, frontend, observability",
    industry: "Data infrastructure",
    overview:
      "The monitoring app keeps cluster health, query activity, and operational signals in a compact interface built for repeated use.",
    highlights: [
      "Dense but readable dashboards for ClickHouse operations.",
      "Focused query and cluster views without marketing-page chrome.",
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
    <div className="min-h-screen bg-[#f8f8f2] text-[#1a1a1a] dark:bg-[#0d0e0c] dark:text-[#f8f8f2]">
      <SiteHeader />

      <main className="relative z-10 rounded-b-3xl bg-[#f8f8f2] pb-16 dark:bg-[#0d0e0c] 2xl:rounded-b-[4rem]">
        <section className="mx-auto max-w-[1340px] px-5 py-12 sm:px-8 md:py-16 lg:px-10 lg:py-24 xl:py-28">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#1a1a1a]/70 hover:text-[#1a1a1a] dark:text-[#f8f8f2]/70 dark:hover:text-[#f8f8f2]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
          <div className="space-y-4 md:space-y-6 lg:space-y-8">
            <p className="text-sm font-medium text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
              {product.eyebrow}
            </p>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
              {product.name}
            </h1>
            <p className="max-w-[580px] text-lg leading-7 lg:text-xl">
              {product.summary}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1340px] px-5 sm:px-8 lg:px-10">
          <img
            src={product.image}
            alt={`${product.name} product screenshot`}
            className="aspect-[4/3] w-full rounded-lg bg-[#050505] object-cover sm:aspect-[6/4] lg:aspect-[5/3] xl:rounded-xl"
          />
        </section>

        <section className="mx-auto mt-16 max-w-[1340px] px-5 sm:px-8 md:mt-20 lg:mt-24 lg:px-10">
          <div className="space-y-4 lg:space-y-6">
            <h2 className="text-lg lg:text-xl">About {product.name}</h2>
            <p className="max-w-[1180px] text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl xl:text-5xl">
              {product.overview}
            </p>
          </div>

          <div className="my-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:mt-16 lg:gap-6 xl:mt-20 xl:gap-8">
            <Meta label="Product" value={product.name} />
            <Meta label="Industry" value={product.industry} />
            <Meta label="Role" value={product.role} />
            <Meta label="Year" value={product.year} />
          </div>

          <div className="space-y-4 lg:space-y-6">
            <h2 className="text-lg lg:text-xl">Highlights</h2>
            <div className="grid gap-4 md:grid-cols-3 lg:gap-6 xl:gap-8">
              {product.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-lg border border-[#1a1a1a]/10 bg-white p-5 dark:border-white/10 dark:bg-[#1a1a1a]"
                >
                  <p className="text-base font-semibold leading-snug md:text-lg">
                    {highlight}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="my-12 flex justify-center lg:my-16">
            <a
              href={addUtmParams(
                product.url,
                "homepage",
                `${product.slug}_product_page`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-6 py-4 text-base font-medium text-white transition-colors hover:bg-[#444] dark:bg-[#f8f8f2] dark:text-[#0d0e0c] dark:hover:bg-white md:text-lg"
            >
              Visit project
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-[1340px] px-5 sm:px-8 lg:mt-28 lg:px-10 xl:mt-32">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl xl:text-5xl">
            More projects
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6 xl:mt-16 xl:gap-8">
            {related.map((item) => (
              <Link
                key={item.slug}
                to="/p/$project"
                params={{ project: item.slug }}
                className="group relative overflow-hidden rounded-lg bg-[#050505]"
              >
                <img
                  src={item.image}
                  alt=""
                  className="aspect-[4/3] w-full object-cover opacity-75 transition-transform duration-500 group-hover:scale-[1.025] sm:aspect-[6/4]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent" />
                <div className="absolute left-6 top-6 z-10 text-white lg:left-8 lg:top-8">
                  <p className="text-xl font-medium">{item.name}</p>
                  <p className="text-sm opacity-80">{item.eyebrow}</p>
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
    <div className="border-t border-[#1a1a1a]/15 pt-3 dark:border-white/15">
      <h3 className="text-sm text-[#1a1a1a]/60 dark:text-[#f8f8f2]/60 lg:text-base">
        {label}
      </h3>
      <p className="mt-1 text-base font-semibold lg:text-lg">{value}</p>
    </div>
  );
}
