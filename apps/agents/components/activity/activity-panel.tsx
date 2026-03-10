"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge, Button, Tabs, TabsList, TabsTrigger, TabsContent } from "@duyet/components";
import { cn } from "@duyet/libs";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  Network,
  ListTree,
  FileCode,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ActivityPanelProps } from "@/lib/types";
import { ThinkingDots, ThinkingSteps } from "./thinking-steps";
import { ToolExecutionItem } from "./tool-execution-item";
import { GraphVisualizer } from "@/components/graph";
import { NodeTraceTimeline } from "@/components/graph";
import { StateInspector } from "@/components/graph";

export function ActivityPanel({
  executions,
  thinkingSteps = [],
  isLoading = false,
  onClose,
  className,
  // Graph state for enhanced activity panel (Unit 19)
  graphState,
  nodeTraces = [],
}: ActivityPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "process" | "files" | "graph" | "trace" | "state"
  >("process");

  // Determine if graph tabs are available
  const hasGraphData = graphState != null;
  const hasTraceData = nodeTraces.length > 0;

  // Auto-switch to graph tab if graph data is available and no legacy activity
  useEffect(() => {
    if (hasGraphData && activeTab === "process" && executions.length === 0) {
      setActiveTab("graph");
    }
  }, [hasGraphData, activeTab, executions.length]);

  // Calculate stats (memoized)
  const { completeCount, errorCount, runningCount, totalDuration } = useMemo(() => {
    const complete = executions.filter((e) => e.status === "complete").length;
    const error = executions.filter((e) => e.status === "error").length;
    const running = executions.filter((e) => e.status === "running").length;
    const duration = executions
      .filter((e) => e.endTime)
      .reduce((sum, e) => sum + (e.endTime || 0) - e.startTime, 0);
    return { completeCount: complete, errorCount: error, runningCount: running, totalDuration: duration };
  }, [executions]);

  // Graph stats from traces (single-pass reduction)
  const graphStats = useMemo(() => {
    return nodeTraces.reduce(
      (acc, t) => {
        if (t.outcome === "success") acc.completeCount++;
        if (t.outcome === "error") acc.errorCount++;
        acc.totalDuration += t.duration ?? 0;
        return acc;
      },
      { completeCount: 0, errorCount: 0, totalDuration: 0 }
    );
  }, [nodeTraces]);

  const hasActivity =
    executions.length > 0 || thinkingSteps.length > 0 || isLoading;

  // Build graph data from state and traces
  const graphData = graphState ? {
    nodes: [
      { id: "input", position: { x: 0, y: 0 }, type: "input", data: { label: "Input", nodeType: "input" as const } },
      { id: "llm-router", position: { x: 200, y: 0 }, type: "conditional", data: { label: "LLM Router", nodeType: "conditional" as const } },
      { id: "search-blog", position: { x: 400, y: 0 }, type: "tool", data: { label: "Search Blog", nodeType: "tool" as const } },
      { id: "get-cv", position: { x: 400, y: 100 }, type: "tool", data: { label: "Get CV", nodeType: "tool" as const } },
      { id: "get-github", position: { x: 400, y: 200 }, type: "tool", data: { label: "Get GitHub", nodeType: "tool" as const } },
      { id: "get-analytics", position: { x: 400, y: 300 }, type: "tool", data: { label: "Get Analytics", nodeType: "tool" as const } },
      { id: "get-about", position: { x: 400, y: 400 }, type: "tool", data: { label: "Get About", nodeType: "tool" as const } },
      { id: "fetch-llms-txt", position: { x: 400, y: 500 }, type: "tool", data: { label: "Fetch LLMs.txt", nodeType: "tool" as const } },
      { id: "synthesis", position: { x: 600, y: 250 }, type: "output", data: { label: "Synthesis", nodeType: "synthesis" as const } },
    ],
    edges: [
      { id: "input-router", source: "input", target: "llm-router", label: "route" },
      { id: "router-search", source: "llm-router", target: "search-blog", label: "search-blog" },
      { id: "router-cv", source: "llm-router", target: "get-cv", label: "get-cv" },
      { id: "router-github", source: "llm-router", target: "get-github", label: "get-github" },
      { id: "router-analytics", source: "llm-router", target: "get-analytics", label: "get-analytics" },
      { id: "router-about", source: "llm-router", target: "get-about", label: "get-about" },
      { id: "router-llms", source: "llm-router", target: "fetch-llms-txt", label: "fetch-llms-txt" },
      { id: "search-synthesis", source: "search-blog", target: "synthesis", label: "result" },
      { id: "cv-synthesis", source: "get-cv", target: "synthesis", label: "result" },
      { id: "github-synthesis", source: "get-github", target: "synthesis", label: "result" },
      { id: "analytics-synthesis", source: "get-analytics", target: "synthesis", label: "result" },
      { id: "about-synthesis", source: "get-about", target: "synthesis", label: "result" },
      { id: "llms-synthesis", source: "fetch-llms-txt", target: "synthesis", label: "result" },
    ],
  } : undefined;

  // Get active node from traces
  const activeNodeId = nodeTraces.length > 0
    ? nodeTraces[nodeTraces.length - 1].nodeId
    : undefined;

  // Get previous state from traces for diff
  const prevState = nodeTraces.length > 1
    ? nodeTraces[nodeTraces.length - 2].outputState as any
    : undefined;

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as any)}
      className={cn(
        "flex flex-col h-full bg-background border-l border-border",
        className
      )}
    >
      {/* Header Tabs */}
      <div className="border-b border-border bg-muted/10 pt-2 px-2 flex items-center justify-between">
        <TabsList className="flex items-center gap-1.5 relative top-[1px] bg-transparent p-0">
          <TabsTrigger
            value="process"
            className="px-3 py-1.5 text-xs font-medium rounded-t-md rounded-b-none transition-colors data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-b-0 data-[state=active]:border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=inactive]:border-transparent"
          >
            Current Process
          </TabsTrigger>

          {hasGraphData && (
            <>
              <TabsTrigger
                value="graph"
                className="px-3 py-1.5 text-xs font-medium rounded-t-md rounded-b-none transition-colors data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-b-0 data-[state=active]:border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=inactive]:border-transparent"
              >
                <Network className="h-3 w-3 mr-1" />
                Graph
              </TabsTrigger>

              <TabsTrigger
                value="trace"
                className="px-3 py-1.5 text-xs font-medium rounded-t-md rounded-b-none transition-colors data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-b-0 data-[state=active]:border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=inactive]:border-transparent"
              >
                <ListTree className="h-3 w-3 mr-1" />
                Trace
              </TabsTrigger>

              <TabsTrigger
                value="state"
                className="px-3 py-1.5 text-xs font-medium rounded-t-md rounded-b-none transition-colors data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-b-0 data-[state=active]:border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=inactive]:border-transparent"
              >
                <FileCode className="h-3 w-3 mr-1" />
                State
              </TabsTrigger>
            </>
          )}

          <TabsTrigger
            value="files"
            className="px-3 py-1.5 text-xs font-medium rounded-t-md rounded-b-none transition-colors data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-b-0 data-[state=active]:border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=inactive]:border-transparent"
          >
            Files
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2 pb-1 pr-1">
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={onClose}
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Close panel</span>
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 bg-background relative z-10">
        {/* Process Tab - Legacy view */}
        <TabsContent value="process" className="p-4 space-y-4 m-0">
          {/* Top Stats */}
          {hasActivity && (
            <div className="flex items-center gap-2 pb-2">
              {runningCount > 0 && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" />
                  {runningCount}
                </Badge>
              )}
              {completeCount > 0 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border">
                  <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                  {completeCount}
                </Badge>
              )}
              {errorCount > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  <AlertCircle className="h-2.5 w-2.5 mr-1" />
                  {errorCount}
                </Badge>
              )}
              {totalDuration > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono ml-auto">
                  <Clock className="h-2.5 w-2.5" />
                  <span>{totalDuration}ms</span>
                </div>
              )}
            </div>
          )}

          {/* Thinking steps */}
          {(thinkingSteps.length > 0 || isLoading) && (
            <div className="rounded-md border border-border bg-muted/30 p-3">
              {thinkingSteps.length > 0 ? (
                <ThinkingSteps steps={thinkingSteps} />
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ThinkingDots />
                  <span>Thinking...</span>
                </div>
              )}
            </div>
          )}

          {/* Tool executions */}
          {executions.length > 0 && (
            <div className="space-y-2">
              {executions.map((execution) => (
                <ToolExecutionItem key={execution.id} execution={execution} />
              ))}
            </div>
          )}

          {/* Show message if no data */}
          {!hasActivity && !hasGraphData && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Activity className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm font-medium text-foreground">No activity yet</p>
              <p className="text-xs mt-1">Agent activity will appear here.</p>
            </div>
          )}
        </TabsContent>

        {/* Graph Tab - Node-edge visualization (Unit 18) */}
        <TabsContent value="graph" className="p-0 m-0">
          {graphData && graphState ? (
            <div className="h-full min-h-[400px]">
              {/* Graph stats header */}
              <div className="px-4 py-2 border-b border-border bg-muted/10 flex items-center gap-2">
                {graphStats.completeCount > 0 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border">
                    <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                    {graphStats.completeCount}
                  </Badge>
                )}
                {graphStats.errorCount > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                    <AlertCircle className="h-2.5 w-2.5 mr-1" />
                    {graphStats.errorCount}
                  </Badge>
                )}
                {graphStats.totalDuration > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono ml-auto">
                    <Clock className="h-2.5 w-2.5" />
                    <span>{graphStats.totalDuration}ms</span>
                  </div>
                )}
              </div>

              <GraphVisualizer
                graphData={graphData}
                traces={nodeTraces}
                activeNodeId={activeNodeId}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center text-muted-foreground p-8">
              <Network className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm font-medium text-foreground">No graph data</p>
              <p className="text-xs mt-1">Graph visualization requires agent execution.</p>
            </div>
          )}
        </TabsContent>

        {/* Trace Tab - Node execution timeline (Unit 16) */}
        <TabsContent value="trace" className="p-0 m-0">
          {hasTraceData ? (
            <NodeTraceTimeline traces={nodeTraces} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center text-muted-foreground p-8">
              <ListTree className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm font-medium text-foreground">No execution traces</p>
              <p className="text-xs mt-1">Node traces will appear after agent execution.</p>
            </div>
          )}
        </TabsContent>

        {/* State Tab - State inspector (Unit 17) */}
        <TabsContent value="state" className="p-0 m-0">
          {graphState ? (
            <div className="h-full min-h-[400px]">
              <StateInspector
                state={graphState}
                prevState={prevState}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center text-muted-foreground p-8">
              <FileCode className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm font-medium text-foreground">No state data</p>
              <p className="text-xs mt-1">Agent state requires active conversation.</p>
            </div>
          )}
        </TabsContent>

        {/* Files Tab - Placeholder */}
        <TabsContent value="files" className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground h-full min-h-[300px] m-0">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Activity className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground">No files active</p>
          <p className="text-xs mt-1">Files related to this conversation will appear here.</p>
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
}
