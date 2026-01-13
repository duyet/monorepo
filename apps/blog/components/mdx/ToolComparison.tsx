import React from "react";

interface ToolComparisonProps {
  tools: Array<{
    name: string;
    pros: string[];
    cons: string[];
    rating: number;
  }>;
}

/**
 * ToolComparison Component
 * Displays a grid of tools with their pros, cons, and star ratings
 */
export const ToolComparison: React.FC<ToolComparisonProps> = ({ tools }) => {
  return (
    <div className="w-full overflow-x-auto mb-8">
      <h3 className="text-2xl font-bold mb-6 text-center">Tool Comparison</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <div key={index} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="text-xl font-semibold mb-2">{tool.name}</h4>
            <div className="flex items-center mb-3">
              <span className="text-yellow-500 text-lg">
                {"★".repeat(Math.floor(tool.rating))}
                {"☆".repeat(5 - Math.floor(tool.rating))}
              </span>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {tool.rating.toFixed(1)}/5.0
              </span>
            </div>
            <div className="mb-3">
              <h5 className="font-medium text-green-600 dark:text-green-400 mb-1">Pros:</h5>
              <ul className="list-disc list-inside text-sm">
                {tool.pros.map((pro, i) => (
                  <li key={i}>{pro}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-red-600 dark:text-red-400 mb-1">Cons:</h5>
              <ul className="list-disc list-inside text-sm">
                {tool.cons.map((con, i) => (
                  <li key={i}>{con}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
