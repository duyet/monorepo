"use client";

import { Brain, Cable, Coins, Gauge, Sparkles, Wrench } from "lucide-react";
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
    <>
      <SidebarHeader className="gap-3 border-b px-4 py-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Model
          </p>
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
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarGroup className="px-4 py-4">
            <SidebarGroupLabel className="px-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Analytics
            </SidebarGroupLabel>
            <SidebarGroupContent className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Coins className="h-4 w-4 text-muted-foreground" />
                      Tokens
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <div className="text-2xl font-semibold">
                      {formatCompact(tokenStats.total)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCompact(tokenStats.prompt)} prompt /{" "}
                      {formatCompact(tokenStats.completion)} completion
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      Tool Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="font-medium">{completeCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Running</span>
                      <span className="font-medium">{runningCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Approvals</span>
                      <span className="font-medium">{approvalCount}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Brain className="h-4 w-4 text-muted-foreground" />
                      Agent State
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Thinking steps
                      </span>
                      <span className="font-medium">{thinkingStepsCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Selected model
                      </span>
                      <Badge
                        variant="secondary"
                        className="max-w-[11rem] truncate"
                      >
                        {modelId}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator />

          <SidebarGroup className="px-4 py-4">
            <SidebarGroupLabel className="px-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              MCP Servers
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-3">
              {MCP_SERVERS.map((server) => (
                <Card key={server.name}>
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="rounded-md border p-2">
                      <Cable className="h-4 w-4 text-muted-foreground" />
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

          <Separator />

          <SidebarGroup className="px-4 py-4">
            <SidebarGroupLabel className="px-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Tools
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-2">
              {TOOLS.map((toolName) => (
                <div
                  key={toolName}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">{toolName}</span>
                  </div>
                  <Badge variant="outline">Ready</Badge>
                </div>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t px-4 py-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5" />
            Live session
          </span>
          <span>{toolExecutions.length} events</span>
        </div>
      </SidebarFooter>
    </>
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
