import React, { useState } from 'react';

export interface Tool {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  rating: number; // 1-10
  price: string;
}

export interface ToolComparisonProps {
  tools: Tool[];
  title?: string;
}

/**
 * ToolComparison - Card-based tool comparison with pros/cons and ratings
 */
export const ToolComparison: React.FC<ToolComparisonProps> = ({
  tools,
  title = 'Tool Comparison'
}) => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const toggleTool = (name: string) => {
    setSelectedTool(selectedTool === name ? null : name);
  };

  return (
    <div className="my-6">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedTool === tool.name
                ? 'border-blue-500 shadow-lg bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => toggleTool(tool.name)}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-lg">{tool.name}</h4>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">{tool.price}</span>
            </div>

            <p className="text-sm text-gray-600 mb-3">{tool.description}</p>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${tool.rating * 10}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{tool.rating}/10</span>
            </div>

            {selectedTool === tool.name && (
              <div className="mt-3 space-y-2">
                <div>
                  <span className="text-sm font-semibold text-green-600">Pros:</span>
                  <ul className="text-sm list-disc list-inside ml-2">
                    {tool.pros.map((pro, idx) => (
                      <li key={idx} className="text-green-700">{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-sm font-semibold text-red-600">Cons:</span>
                  <ul className="text-sm list-disc list-inside ml-2">
                    {tool.cons.map((con, idx) => (
                      <li key={idx} className="text-red-700">{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {selectedTool ? `Click "${selectedTool}" to collapse details` : 'Click any card to see detailed pros and cons'}
      </p>
    </div>
  );
};