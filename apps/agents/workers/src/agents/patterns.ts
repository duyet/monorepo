export type PatternName =
  | "sequential"
  | "routing"
  | "parallel"
  | "orchestrator"
  | "evaluator";

export function detectPattern(input: string): PatternName {
  const text = input.toLowerCase();
  if (text.includes("compare") || text.includes("review") || text.includes("evaluate")) {
    return "evaluator";
  }
  if (text.includes("and") || text.includes("parallel") || text.includes("both")) {
    return "parallel";
  }
  if (text.includes("plan") || text.includes("steps") || text.includes("break down")) {
    return "orchestrator";
  }
  if (text.includes("route") || text.includes("classify")) {
    return "routing";
  }
  return "sequential";
}

export function buildPatternHint(pattern: PatternName): string {
  switch (pattern) {
    case "routing":
      return "Route to a specialist answer style based on user intent.";
    case "parallel":
      return "Generate multiple short candidates and merge into one response.";
    case "orchestrator":
      return "Break work into ordered subtasks and solve step by step.";
    case "evaluator":
      return "Draft answer, self-check quality, then revise once.";
    case "sequential":
    default:
      return "Solve with a direct sequential reasoning flow.";
  }
}
