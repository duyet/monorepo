import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/category")({
  // No head() on purpose. This route is a redirect guard plus an <Outlet/> for
  // `/category/$category`, so every document it renders is a child's — and
  // `links` are concatenated across the matched chain without dedup. A
  // canonical here would be a second one on top of the child's, pointing at
  // the bare `/category`. `/category/$category` owns the card.
  beforeLoad: ({ location }) => {
    const path = location.pathname.replace(/\/+$/, "") || "/";
    if (path === "/category") {
      throw redirect({ to: "/categories/", replace: true });
    }
  },
  component: () => <Outlet />,
});
