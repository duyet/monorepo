import { getCompiledGraph } from "../backend/agent";

const graph = getCompiledGraph(undefined, {
  ANYROUTER_API_KEY: "sk-ar-v1-1y2k45332j1e526d2lt2u64666k592r6z1p3d3e5229vy4o3",
  ANYROUTER_MODEL: "@preset/duyetbot",
});

console.log("Simulating graph execution with mock state...");
try {
  // We call graph.invoke which executes the compiled graph
  const response = await graph.invoke({
    messages: [
      { type: "human", content: "hi" }
    ]
  });
  console.log("Execution finished successfully! Response:", response);
} catch (e: any) {
  console.error("Graph invocation error:", e.stack || e.message || e);
}
