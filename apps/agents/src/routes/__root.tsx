import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Providers } from "@/components/providers";
import NotFound from "@/app/not-found";
import { AnalyticsScripts } from "@/src/analytics";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <Providers>
      <Outlet />
      <AnalyticsScripts />
    </Providers>
  );
}
