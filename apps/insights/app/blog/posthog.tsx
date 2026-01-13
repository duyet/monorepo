import { PopularContentTable } from "@/components/PopularContentTable";
import { CompactMetric } from "@/components/ui/CompactMetric";
import { isPostHogConfigured, queryPostHog } from "@/lib/posthog";
import { FileText, TrendingUp, Users } from "lucide-react";

interface Path {
  path: string;
  visitors: number;
  views: number;
}

export async function PostHog({ days = 30 }: { days?: number | "all" }) {
  if (!isPostHogConfigured()) {
    return null;
  }

  const top = 20;
  const dateFrom = days === "all" ? "-365d" : `-${days}d`;
  const paths = await getTopPath(top, dateFrom);

  const totalVisitors = paths.reduce((sum, path) => sum + path.visitors, 0);
  const totalViews = paths.reduce((sum, path) => sum + path.views, 0);
  const avgVisitorsPerPage =
    paths.length > 0 ? Math.round(totalVisitors / paths.length) : 0;

  const metrics = [
    {
      label: "Total Visitors",
      value: totalVisitors.toLocaleString(),
      icon: <Users className="h-4 w-4" />,
      change: totalVisitors > 0 ? { value: 18 } : undefined,
    },
    {
      label: "Page Views",
      value: totalViews.toLocaleString(),
      icon: <FileText className="h-4 w-4" />,
      change: totalViews > 0 ? { value: 25 } : undefined,
    },
    {
      label: "Avg per Page",
      value: avgVisitorsPerPage.toLocaleString(),
      icon: <TrendingUp className="h-4 w-4" />,
      change: avgVisitorsPerPage > 0 ? { value: 10 } : undefined,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <CompactMetric
            key={metric.label}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
          />
        ))}
      </div>

      {/* Popular Content Table */}
      <PopularContentTable
        data={paths.map((path) => ({
          name: path.path,
          value: path.visitors,
          href: process.env.NEXT_PUBLIC_DUYET_BLOG_URL + path.path,
        }))}
      />

      <p className="text-xs text-muted-foreground">
        Most Popular Content | Data Source: PostHog | Last updated:{" "}
        {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}

async function getTopPath(limit = 10, dateFrom = "-90d"): Promise<Path[]> {
  const data = await queryPostHog({
    kind: "WebStatsTableQuery",
    properties: [],
    breakdownBy: "Page",
    dateRange: {
      date_from: dateFrom,
      date_to: null,
    },
    includeScrollDepth: false,
    includeBounceRate: true,
    doPathCleaning: false,
    limit,
    useSessionsTable: true,
  });

  if (!data) {
    return [];
  }

  // Map data based on column structure with validation
  const pathIndex = data.columns.findIndex(
    (col) =>
      col.toLowerCase().includes("page") ||
      col.toLowerCase().includes("path") ||
      col.toLowerCase().includes("breakdown_value")
  );
  const visitorsIndex = data.columns.findIndex(
    (col) =>
      col.toLowerCase().includes("visitor") ||
      col.toLowerCase().includes("unique")
  );
  const viewsIndex = data.columns.findIndex(
    (col) =>
      col.toLowerCase().includes("view") ||
      col.toLowerCase().includes("pageview")
  );

  // Validate that we found the expected columns
  if (pathIndex === -1 || visitorsIndex === -1 || viewsIndex === -1) {
    console.warn("PostHog columns not found as expected:", {
      columns: data.columns,
      pathIndex,
      visitorsIndex,
      viewsIndex,
    });
    // Return empty array instead of potentially incorrect data
    return [];
  }

  return data.results.map((result) => {
    const pathValue = result[pathIndex] as string;
    const visitorsData = result[visitorsIndex];
    const viewsData = result[viewsIndex];

    // Handle array format [count, comparison] or simple number
    const visitors = Array.isArray(visitorsData)
      ? Number(visitorsData[0]) || 0
      : Number(visitorsData) || 0;
    const views = Array.isArray(viewsData)
      ? Number(viewsData[0]) || 0
      : Number(viewsData) || 0;

    return {
      path: pathValue,
      visitors,
      views,
    };
  });
}
