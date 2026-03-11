"use client";

import {
  Activity,
  BarChart3,
  Loader2,
  MessageSquare,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChatTopBar } from "@/components/chat/chat-top-bar";
import { useConversations } from "@/lib/hooks";
import { useClerkAuthToken } from "@/lib/hooks/use-clerk-auth";
import { AppSidebar } from "@/components/app-sidebar";
import { AppLayout } from "@/components/layout/app-layout";

interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  totalUsers: number;
  dailyTrends: { date: string; count: number }[];
}

export default function AnalyticsPage() {
  const getAuthToken = useClerkAuthToken();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const { conversations, activeId, switchTo, remove, createNew } =
    useConversations({ getAuthToken });

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetch("/api/analytics", { signal })
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to load analytics:", err);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const sidebarContent = (
    <AppSidebar
      conversations={conversations}
      activeId={activeId}
      onNewChat={() => createNew("fast")}
      onSelectConversation={async (id) => {
        await switchTo(id);
        window.location.href = "/";
      }}
      onDeleteConversation={remove}
    />
  );

  return (
    <AppLayout sidebar={sidebarContent}>
      <div className="flex h-full w-full overflow-hidden relative bg-transparent">
      <div className="relative flex flex-1 flex-col min-w-0 overflow-hidden">
        <ChatTopBar
          onToggleActivity={() => {}}
          onNewChat={() => createNew("fast")}
          showActivityButton={false}
          activityCount={0}
          conversationTitle="Global System Analytics"
        />

      <div className="flex-1 overflow-y-auto w-full bg-background pt-14 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Public overview of agent activity and global system usage.
            </p>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center border border-border rounded-xl bg-muted/20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  title="Total Conversations"
                  value={data.totalConversations}
                  icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard
                  title="Total Messages"
                  value={data.totalMessages}
                  icon={
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  }
                />
                <StatCard
                  title="Active Users"
                  value={data.totalUsers}
                  icon={<Users className="h-4 w-4 text-muted-foreground" />}
                />
              </div>

              {/* Chart */}
              <div className="border border-border rounded-xl bg-background p-6">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="h-5 w-5 text-foreground" />
                  <h2 className="text-lg font-medium">
                    Conversations (Last 7 Days)
                  </h2>
                </div>
                <div className="h-[300px] w-full">
                  {data.dailyTrends?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={data.dailyTrends}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorCount"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#8884d8"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#8884d8"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="var(--border)"
                        />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 12,
                            fill: "var(--muted-foreground)",
                          }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 12,
                            fill: "var(--muted-foreground)",
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--background)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#8884d8"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorCount)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                      Not enough data to graph recent trends.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center border border-border rounded-xl bg-muted/20 text-destructive text-sm">
              Failed to load analytics data.
            </div>
          )}
        </div>
      </div>
      </div>
      </div>
    </AppLayout>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
          {title}
        </h3>
        {icon}
      </div>
      <div className="text-2xl font-bold">{(value || 0).toLocaleString()}</div>
    </div>
  );
}
