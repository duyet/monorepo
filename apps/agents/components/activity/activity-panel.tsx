
import {
  Badge,
  Button,
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@duyet/components";
import { cn } from "@duyet/libs";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCode,
  ListTree,
  Loader2,
  Network,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  GraphVisualizer,
  NodeTraceTimeline,
  StateInspector,
} from "@/components/graph";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ActivityPanelProps } from "@/lib/types";
import { ThinkingDots, ThinkingSteps } from "./thinking-steps";
import { ToolExecutionItem } from "./tool-execution-item";

export function ActivityPanel({
  executions,
  thinkingSteps = [],
  isLoading = false,
  onClose,
  className,
  // Graph state for enhanced activity panel (Unit 19)
  graphState,
  nodeTraces = [],
  // Visual graph data from GraphRouter (Unit 10)
  graphData,
}: ActivityPanelProps) {
  // Determine if graph tabs are available
  const hasGraphData = graphState != null;
  const hasTraceData = nodeTraces.length > 0;

  // Auto-switch to graph tab if graph data is available and no legacy activity
  // Compute initial tab to avoid extra render
  const [activeTab, setActiveTab] = useState<
    "process" | "files" | "graph" | "trace" | "state"
  >(() => {
    if (hasGraphData && executions.length === 0) {
      return "graph";
    }
    return "process";
  });

  // Calculate stats (memoized, single-pass)
  const { completeCount, errorCount, runningCount, totalDuration } =
    useMemo(() => {
      return executions.reduce(
        (acc, e) => {
          if (e.status === "complete") acc.completeCount++;
          else if (e.status === "error") acc.errorCount++;
          else if (e.status === "running") acc.runningCount++;
          if (e.endTime) acc.totalDuration += e.endTime - e.startTime;
          return acc;
        },
        { completeCount: 0, errorCount: 0, runningCount: 0, totalDuration: 0 }
      );
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

  // Get active node from traces
  const activeNodeId =
    nodeTraces.length > 0
      ? nodeTraces[nodeTraces.length - 1].nodeId
      : undefined;

  // Get previous state from traces for diff
  const prevState =
    nodeTraces.length > 1
      ? (nodeTraces[nodeTraces.length - 2].outputState as any)
      : undefined;

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as any)}
      className={cn(
        "flex flex-col h-full border-l border-border",
        className
      )}
    >
      {/* Header Tabs */}
      <div className="border-b border-border bg-muted/10 pt-2 px-2 flex items-center justify-between">
        <TabsList className="flex items-center gap-1.5 relative top-[1px] bg-transparent p-0">
          <TabsTrigger
            value="process"
            className="px-3 py-1.5 text-xs font-medium rounded-t-md rounded-b-none transition-colors data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-b-0 data-[state=active]:border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=inactive]:border-transparent"
          >
            Current Process
          </TabsTrigger>

          {hasGraphData && (
            <>
              <TabsTrigger
                value="graph"
                className="px-3 py-1.5 text-xs font-medium rounded-t-md rounded-b-none transition-colors data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-b-0 data-[state=active]:border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=inactive]:border-transparent"
              >
                <Network className="h-3 w-3 mr-1" />
                Graph
              </TabsTrigger>

              <TabsTrigger
                value="trace"
                className="px-3 py-1.5 text-xs font-medium rounded-t-md rounded-b-none transition-colors data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-b-0 data-[state=active]:border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=inactive]:border-transparent"
              >
                <ListTree className="h-3 w-3 mr-1" />
                Trace
              </TabsTrigger>

              <TabsTrigger
                value="state"
                className="px-3 py-1.5 text-xs font-medium rounded-t-md rounded-b-none transition-colors data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-b-0 data-[state=active]:border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=inactive]:border-transparent"
              >
                <FileCode className="h-3 w-3 mr-1" />
                State
              </TabsTrigger>
            </>
          )}

          <TabsTrigger
            value="files"
            className="px-3 py-1.5 text-xs font-medium rounded-t-md rounded-b-none transition-colors data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-b-0 data-[state=active]:border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=inactive]:border-transparent"
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
      <ScrollArea className="flex-1 relative z-10">
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
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 border-border"
                >
                  <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                  {completeCount}
                </Badge>
              )}
              {errorCount > 0 && (
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0"
                >
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
            <Card>
              <CardContent className="p-4">
                {thinkingSteps.length > 0 ? (
                  <ThinkingSteps steps={thinkingSteps} />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ThinkingDots />
                    <span>Thinking...</span>
                  </div>
                )}
              </CardContent>
            </Card>
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
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-8 w-8 mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium">No activity yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Agent activity will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Graph Tab - Node-edge visualization (Unit 18) */}
        <TabsContent value="graph" className="p-0 m-0">
          {graphData ? (
            <div className="h-full min-h-[400px]">
              {/* Graph stats header */}
              <div className="px-4 py-2 border-b border-border bg-muted/10 flex items-center gap-2">
                {graphStats.completeCount > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 border-border"
                  >
                    <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                    {graphStats.completeCount}
                  </Badge>
                )}
                {graphStats.errorCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="text-[10px] px-1.5 py-0"
                  >
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
            <Card className="m-4">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Network className="h-12 w-12 mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium">No graph data</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Graph visualization requires agent execution.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trace Tab - Node execution timeline (Unit 16) */}
        <TabsContent value="trace" className="p-0 m-0">
          {hasTraceData ? (
            <NodeTraceTimeline traces={nodeTraces} />
          ) : (
            <Card className="m-4">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ListTree className="h-12 w-12 mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium">No execution traces</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Node traces will appear after agent execution.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* State Tab - State inspector (Unit 17) */}
        <TabsContent value="state" className="p-0 m-0">
          {graphState ? (
            <div className="h-full min-h-[400px]">
              <StateInspector state={graphState} prevState={prevState} />
            </div>
          ) : (
            <Card className="m-4">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileCode className="h-12 w-12 mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium">No state data</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Agent state requires active conversation.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Files Tab - Placeholder */}
        <TabsContent value="files" className="p-4 m-0">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Activity className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium">No files active</p>
              <p className="text-xs text-muted-foreground mt-1">
                Files related to this conversation will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
}
