"use client";

import { Brain, Cable, Coins, Gauge, Sparkles, Wrench } from "lucide-react";
import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ToolExecution } from "@/lib/types";

const OPENROUTER_MODELS = [
  "openrouter/auto",
  "openrouter/free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "stepfun/step-3.5-flash:free",
  "z-ai/glm-4.5-air:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "qwen/qwen3-coder:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "minimax/minimax-m2.5:free",
  "openai/gpt-oss-120b:free",
  "openai/gpt-oss-20b:free",
] as const;

const MCP_SERVERS = [
  {
    name: "duyet-mcp",
    description: "Primary MCP server for blog, CV, GitHub, and analytics.",
    status: "Connected",
  },
] as const;

const TOOLS = [
  "searchBlog",
  "getBlogPost",
  "getCV",
  "getGitHub",
  "getAnalytics",
  "getAbout",
  "fetchLlmsTxt",
] as const;

type TokenStats = {
  prompt: number;
  completion: number;
  total: number;
};

interface RightSidebarProps {
  mobile?: boolean;
  modelId: string;
  onModelChange: (value: string) => void;
  tokenStats: TokenStats;
  toolExecutions: ToolExecution[];
  approvalCount: number;
  thinkingStepsCount: number;
}

function formatCompact(value: number) {
  if (value < 1000) return `${value}`;
  return `${(value / 1000).toFixed(1)}k`;
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-border/70 bg-background shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Icon className="text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-semibold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function RightSidebar({
  mobile = false,
  modelId,
  onModelChange,
  tokenStats,
  toolExecutions,
  approvalCount,
  thinkingStepsCount,
}: RightSidebarProps) {
  const runningCount = toolExecutions.filter(
    (execution) => execution.status === "running"
  ).length;
  const completeCount = toolExecutions.filter(
    (execution) => execution.status === "complete"
  ).length;

  const content = (
    <Tabs defaultValue="status" className="flex h-full flex-col">
      <SidebarHeader className="border-b px-4 py-4">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Inspector
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Model choice, runtime state, and tool activity
            </p>
          </div>

          <Select value={modelId} onValueChange={onModelChange}>
            <SelectTrigger className="h-10 w-full bg-background">
              <SelectValue placeholder="Choose a model" />
            </SelectTrigger>
            <SelectContent>
              {OPENROUTER_MODELS.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <TabsList className="grid h-10 w-full grid-cols-2 rounded-full border bg-muted/40 p-1">
            <TabsTrigger className="rounded-full" value="status">
              Status
            </TabsTrigger>
            <TabsTrigger className="rounded-full" value="tools">
              Tools
            </TabsTrigger>
          </TabsList>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          <TabsContent className="mt-0 space-y-4 p-4" value="status">
            <SidebarGroup className="px-0 py-0">
              <SidebarGroupLabel className="px-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Analytics
              </SidebarGroupLabel>
              <SidebarGroupContent className="grid gap-3">
                <MetricCard
                  icon={Coins}
                  title="Tokens"
                  value={formatCompact(tokenStats.total)}
                  description={`${formatCompact(tokenStats.prompt)} prompt / ${formatCompact(tokenStats.completion)} completion`}
                />
                <MetricCard
                  icon={Wrench}
                  title="Tool activity"
                  value={`${completeCount}/${toolExecutions.length}`}
                  description={`${runningCount} running, ${approvalCount} approvals`}
                />
                <MetricCard
                  icon={Brain}
                  title="Agent state"
                  value={formatCompact(thinkingStepsCount)}
                  description="Thinking steps observed in this conversation"
                />
              </SidebarGroupContent>
            </SidebarGroup>

            <Separator />

            <SidebarGroup className="px-0 py-0">
              <SidebarGroupLabel className="px-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                MCP servers
              </SidebarGroupLabel>
              <SidebarGroupContent className="space-y-3">
                {MCP_SERVERS.map((server) => (
                  <Card
                    key={server.name}
                    className="border-border/70 bg-background shadow-sm"
                  >
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className="rounded-xl border bg-muted/40 p-2">
                        <Cable className="text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">
                            {server.name}
                          </p>
                          <Badge variant="secondary">{server.status}</Badge>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {server.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          </TabsContent>

          <TabsContent className="mt-0 space-y-3 p-4" value="tools">
            <SidebarGroup className="px-0 py-0">
              <SidebarGroupLabel className="px-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Available tools
              </SidebarGroupLabel>
              <SidebarGroupContent className="space-y-2">
                {TOOLS.map((toolName) => (
                  <div
                    key={toolName}
                    className="flex items-center justify-between rounded-2xl border bg-background px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-muted-foreground" />
                      <span className="text-sm font-medium">{toolName}</span>
                    </div>
                    <Badge variant="outline">Ready</Badge>
                  </div>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>

            <Separator />

            <SidebarGroup className="px-0 py-0">
              <SidebarGroupLabel className="px-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Live session
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <Card className="border-border/70 bg-background shadow-sm">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Gauge />
                      Streaming context
                    </div>
                    <Badge variant="secondary">
                      {toolExecutions.length} events
                    </Badge>
                  </CardContent>
                </Card>
              </SidebarGroupContent>
            </SidebarGroup>
          </TabsContent>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t px-4 py-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Model inspector</span>
          <span>{mobile ? "Mobile" : "Desktop"}</span>
        </div>
      </SidebarFooter>
    </Tabs>
  );

  if (mobile) {
    return <div className="flex h-full flex-col bg-background">{content}</div>;
  }

  return (
    <Sidebar
      side="right"
      variant="sidebar"
      collapsible="none"
      className="hidden border-l bg-background lg:flex"
    >
      {content}
    </Sidebar>
  );
}
