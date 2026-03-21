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

export const Route = createRootRoute({
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
