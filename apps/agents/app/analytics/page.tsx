import {
  Activity,
  ChartBar as BarChart3,
  Spinner as Loader2,
  ChatCircle as MessageSquare,
  Users,
} from "@phosphor-icons/react";
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
import { AppSidebar } from "@/components/app-sidebar";
import { ChatTopBar } from "@/components/chat/chat-top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarInset } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConversations } from "@/lib/hooks";
import { useClerkAuthToken } from "@/lib/hooks/use-clerk-auth";

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

  const {
    conversations,
    activeId,
    isLoading: isConversationsLoading,
    switchTo,
    remove,
    createNew,
  } = useConversations({ getAuthToken });

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/analytics", { signal: controller.signal })
      .then((res) => res.json())
      .then((value) => setData(value))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to load analytics:", err);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return (
    <>
      <AppSidebar
        conversations={conversations}
        activeId={activeId}
        isLoading={isConversationsLoading}
        onNewChat={() => createNew("fast")}
        onSelectConversation={async (id) => {
          await switchTo(id);
          window.location.href = "/";
        }}
        onDeleteConversation={remove}
      />

      <SidebarInset>
        <div className="flex min-h-svh flex-col bg-background">
          <ChatTopBar
            conversationTitle="Global analytics"
            onNewChat={() => createNew("fast")}
            subtitle="Read-only dashboard"
          />

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Public overview</Badge>
                  <Badge variant="outline">Live data</Badge>
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight">
                    Analytics Dashboard
                  </h1>
                  <p className="mt-2 max-w-2xl text-muted-foreground">
                    A compact view of workspace usage, message volume, and
                    recent trends across the agent system.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex h-64 items-center justify-center rounded-3xl border bg-muted/20">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
              ) : data ? (
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="grid h-11 w-full max-w-md grid-cols-2 rounded-full border bg-muted/40 p-1">
                    <TabsTrigger className="rounded-full" value="overview">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger className="rounded-full" value="trends">
                      Trends
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent className="space-y-6" value="overview">
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total conversations
                          </CardTitle>
                          <Activity className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-semibold">
                            {data.totalConversations.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total messages
                          </CardTitle>
                          <MessageSquare className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-semibold">
                            {data.totalMessages.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active users
                          </CardTitle>
                          <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-semibold">
                            {data.totalUsers.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="trends">
                    <Card className="shadow-sm">
                      <CardHeader className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-lg font-medium">
                          <BarChart3 className="size-4 text-muted-foreground" />
                          Conversations over the last 7 days
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Recent daily conversation volume across the workspace.
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[320px] w-full">
                          {data.dailyTrends?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={data.dailyTrends}
                                margin={{
                                  top: 10,
                                  right: 10,
                                  left: -20,
                                  bottom: 0,
                                }}
                              >
                                <defs>
                                  <linearGradient
                                    id="countFill"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="5%"
                                      stopColor="hsl(var(--primary))"
                                      stopOpacity={0.25}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="hsl(var(--primary))"
                                      stopOpacity={0}
                                    />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  vertical={false}
                                  stroke="hsl(var(--border))"
                                />
                                <XAxis
                                  dataKey="date"
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{
                                    fontSize: 12,
                                    fill: "hsl(var(--muted-foreground))",
                                  }}
                                  dy={10}
                                />
                                <YAxis
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{
                                    fontSize: 12,
                                    fill: "hsl(var(--muted-foreground))",
                                  }}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                  }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="count"
                                  stroke="hsl(var(--primary))"
                                  strokeWidth={2}
                                  fill="url(#countFill)"
                                  fillOpacity={1}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground">
                              Not enough data to graph recent trends.
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-3xl border bg-muted/20 text-sm text-destructive">
                  Failed to load analytics data.
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
