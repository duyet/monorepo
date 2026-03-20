import Container from "@duyet/components/Container";
import Footer from "@duyet/components/Footer";
import Header from "@duyet/components/Header";
import ThemeProvider from "@/components/ThemeProvider";
import { homelabConfig } from "@duyet/config";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";
import ErrorPage from "@/app/error";
import NotFoundPage from "@/app/not-found";
import { AnalyticsScripts } from "@/src/analytics";

const rootSearchSchema = z.object({
  tab: z.enum(["infrastructure", "smart-devices"]).optional(),
});

export type RootSearch = z.infer<typeof rootSearchSchema>;

export const Route = createRootRoute({
  component: RootComponent,
  validateSearch: (search) => rootSearchSchema.parse(search),
  errorComponent: ({ error, reset }) => (
    <ErrorPage error={error} reset={reset} />
  ),
  notFoundComponent: () => <NotFoundPage />,
});

function RootComponent() {
  return (
    <ThemeProvider>
      <Header
        longText={homelabConfig.header.longText}
        shortText={homelabConfig.header.shortText}
      />
      <main>
        <Container className="mb-20">
          <Outlet />
        </Container>
      </main>
      <Footer />
      <AnalyticsScripts />
    </ThemeProvider>
  );
}
