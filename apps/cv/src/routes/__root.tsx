import "@duyet/components/styles.css";
import "../../app/globals.css";

import Analytics from "@duyet/components/Analytics";
import Container from "@duyet/components/Container";
import Footer from "@duyet/components/Footer";
import Header from "@duyet/components/Header";
import { ABOUT, BLOG, HOME, INSIGHTS, PHOTOS } from "@duyet/components/Menu";
import ThemeProvider from "@duyet/components/ThemeProvider";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";

const personJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Duyet Le",
  jobTitle: "Senior Data Engineer",
  email: "me@duyet.net",
  url: "https://duyet.net",
  sameAs: [
    "https://github.com/duyet",
    "https://linkedin.com/in/duyet",
    "https://blog.duyet.net",
  ],
  description:
    "Data & AI Engineer with 8+ years of experience in modern data warehousing, distributed systems, AI/ML, and cloud computing.",
  knowsAbout: [
    "LlamaIndex",
    "AI SDK",
    "LangGraph",
    "ClickHouse",
    "Apache Spark",
    "Apache Airflow",
    "Python",
    "Rust",
    "TypeScript",
    "Kubernetes",
    "AWS",
    "GCP",
    "Kafka",
    "BigQuery",
    "Helm",
    "Data Engineering",
    "Distributed Systems",
    "Cloud Computing",
    "Data Warehousing",
    "Machine Learning Infrastructure",
    "DevOps",
  ],
  worksFor: {
    "@type": "Organization",
    name: "Cartrack",
    url: "https://cartrack.us",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "University of Information Technology",
  },
});

function NotFoundComponent() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
        <a href="/" className="mt-4 inline-block text-sm underline">
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "robots", content: "follow, index" },
      { httpEquiv: "x-ua-compatible", content: "ie=edge" },
      { title: "Duyet Le | CV" },
      {
        name: "description",
        content:
          "Senior Data Engineer with expertise in data warehousing, distributed systems, and cloud computing.",
      },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", sizes: "any" },
      { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
      { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap",
      },
    ],
    scripts: [{ type: "application/ld+json", children: personJsonLd }],
  }),
  notFoundComponent: NotFoundComponent,
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap"
          media="print"
          // @ts-expect-error onLoad is valid on link elements
          onLoad="this.media='all'"
        />
      </head>
      <body>
        <ThemeProvider>
          <main>
            <Container className="mb-20 mt-10 min-h-screen max-w-3xl md:mt-20 print:mb-10 print:mt-10">
              <Outlet />
            </Container>
          </main>
          <div className="border-t print:hidden">
            <Header
              logo={false}
              containerClassName="max-w-3xl"
              longText="Resume"
              navigationItems={[HOME, BLOG, PHOTOS, INSIGHTS, ABOUT]}
              shortText="CV"
            />
          </div>
          <Footer className="print:hidden" containerClassName="max-w-3xl" />
          <Analytics />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
