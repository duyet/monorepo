import { Star } from 'lucide-react';

interface Tool {
  name: string;
  pros: string[];
  cons: string[];
  rating: number; // 1-5
}

interface ToolComparisonProps {
  tools: Tool[];
}

export function ToolComparison({ tools }: ToolComparisonProps) {
  return (
    <div className="my-6 space-y-4">
      {tools.map((tool) => (
        <div key={tool.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {tool.name}
            </h3>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < tool.rating ? "#fbbf24" : "none"}
                  stroke={i < tool.rating ? "#fbbf24" : "#d1d5db"}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold text-green-600 dark:text-green-400 mb-1">
                ✓ Pros
              </div>
              <ul className="space-y-1">
                {tool.pros.map((pro, idx) => (
                  <li key={idx} className="text-gray-700 dark:text-gray-300">
                    • {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-semibold text-red-600 dark:text-red-400 mb-1">
                ✗ Cons
              </div>
              <ul className="space-y-1">
                {tool.cons.map((con, idx) => (
                  <li key={idx} className="text-gray-700 dark:text-gray-300">
                    • {con}
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