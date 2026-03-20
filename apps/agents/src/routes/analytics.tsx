import { createFileRoute } from "@tanstack/react-router";
import AnalyticsPage from "@/app/analytics/page";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});
