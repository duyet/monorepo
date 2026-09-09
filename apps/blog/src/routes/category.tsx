import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/category")({
  beforeLoad: ({ location }) => {
    const path = location.pathname.replace(/\/+$/, "") || "/";
    if (path === "/category") {
      throw redirect({ to: "/categories/", replace: true });
    }
  },
  component: () => <Outlet />,
});
