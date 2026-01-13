import React from "react";

interface Tool {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  logo?: string;
}

interface ToolComparisonProps {
  tools: Tool[];
  title?: string;
}

/**
 * Side-by-side tool comparison component
 */
export const ToolComparison: React.FC<ToolComparisonProps> = ({
  tools,
  title = "Tool Comparison",
}) => {
  return (
    <div className="my-8 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <h3 className="bg-gray-50 dark:bg-gray-800 px-6 py-3 text-lg font-semibold border-b border-gray-200 dark:border-gray-700">
        {title}
      </h3>
      <div className="grid md:grid-cols-2 gap-0">
        {tools.map((tool, index) => (
          <div
            key={tool.name}
            className={`border-gray-200 dark:border-gray-700 p-6 ${
              index === 0 ? "md:border-r" : ""
            } ${index > 0 ? "md:border-t md:md:border-t-0" : ""} border-t`}
          >
            <div className="flex items-center gap-3 mb-4">
              {tool.logo && (
                <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-bold">
                  {tool.logo}
                </div>
              )}
              <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {tool.name}
              </h4>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              {tool.description}
            </p>

            <div className="space-y-3">
              {tool.pros.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                    ✅ Pros
                  </h5>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    {tool.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tool.cons.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                    ❌ Cons
                  </h5>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    {tool.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};