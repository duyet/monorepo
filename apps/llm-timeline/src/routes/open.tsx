import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/open")({
  beforeLoad: () => {
    throw redirect({ to: "/license/$type", params: { type: "open" } });
  },
  component: () => null,
});
