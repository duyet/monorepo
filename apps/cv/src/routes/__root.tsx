import "@duyet/components/styles.css";
import "../../app/globals.css";

import Analytics from "@duyet/components/Analytics";
import Container from "@duyet/components/Container";
import Footer from "@duyet/components/Footer";
import Head from "@duyet/components/Head";
import Header from "@duyet/components/Header";
import { ABOUT, BLOG, HOME, INSIGHTS, PHOTOS } from "@duyet/components/Menu";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { createRootRoute, Outlet } from "@tanstack/react-router";

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
  notFoundComponent: NotFoundComponent,
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider>
      <Head />
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
  );
}
