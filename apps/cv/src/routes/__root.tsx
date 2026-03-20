import "@duyet/components/styles.css";
import "../../app/globals.css";

import Analytics from "@duyet/components/Analytics";
import Container from "@duyet/components/Container";
import Footer from "@duyet/components/Footer";
import Head from "@duyet/components/Head";
import Header from "@duyet/components/Header";
import { ABOUT, BLOG, HOME, INSIGHTS, PHOTOS } from "@duyet/components/Menu";
import ThemeProvider from "@duyet/components/ThemeProvider";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

const schemaOrgData = {
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
    "Data Engineer with 6+ years of experience in modern data warehousing, distributed systems, and cloud computing.",
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
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Duyet Le | Resume" },
      {
        name: "description",
        content:
          "Data Engineer with 6+ years of experience in modern data warehousing, distributed systems, and cloud computing. Proficient in LlamaIndex, AI SDK, LangGraph, ClickHouse, Spark, Airflow, Python, and Rust.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&family=Libre+Baskerville:wght@400;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(schemaOrgData),
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <Head />
      </head>
      <body className="bg-[var(--background)] font-sans text-[var(--foreground)] antialiased">
        <ThemeProvider>
          <main>
            <Container className="mb-20 mt-10 min-h-screen max-w-3xl md:mt-20 print:mb-10 print:mt-10">
              {children}
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
