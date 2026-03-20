import { createRootRoute, Outlet } from "@tanstack/react-router";
import NotFound from "@/app/not-found";
import { Providers } from "@/components/providers";
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
