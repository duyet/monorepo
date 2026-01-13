"use client";

interface ToolComparisonProps {
  tools: Array<{
    name: string;
    pros: string[];
    cons: string[];
    rating: number; // 1-10
  }>;
}

export function ToolComparison({ tools }: ToolComparisonProps) {
  return (
    <div className="space-y-6 my-6">
      {tools.map((tool, idx) => (
        <div
          key={idx}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{tool.name}</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full ${
                      i < tool.rating ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                {tool.rating}/10
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                ✓ Pros
              </h4>
              <ul className="space-y-1 text-sm">
                {tool.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                ✗ Cons
              </h4>
              <ul className="space-y-1 text-sm">
                {tool.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}