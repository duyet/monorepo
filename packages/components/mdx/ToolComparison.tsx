import React from "react";
import { cn } from "@duyet/libs/utils";

export interface Tool {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  rating: number;
  icon?: React.ReactNode;
}

export interface ToolComparisonProps {
  tools: Tool[];
  className?: string;
}

export function ToolComparison({ tools, className }: ToolComparisonProps) {
  const [selectedTool, setSelectedTool] = React.useState<Tool | null>(null);

  const selectedToolIndex = selectedTool
    ? tools.findIndex((tool) => tool.name === selectedTool.name)
    : -1;

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Tool Comparison</h2>
        <p className="text-muted-foreground">
          Click on tools below to compare their features and ratings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className={cn(
              "border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
              selectedToolIndex === tools.indexOf(tool)
                ? "border-primary bg-primary/5"
                : "border-border"
            )}
            onClick={() => setSelectedTool(tool)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{tool.name}</h3>
              <div className="flex items-center">
                <span className="text-sm mr-1">⭐</span>
                <span className="font-bold">{tool.rating}/5</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-3">
              {tool.description}
            </p>
            <div className="space-y-1">
              <div className="flex items-center text-xs">
                <span className="text-green-600 mr-1">✓</span>
                <span className="font-medium">Pros:</span>
              </div>
              <ul className="ml-4 text-xs space-y-1">
                {tool.pros.slice(0, 2).map((pro, index) => (
                  <li key={index} className="text-muted-foreground">
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {selectedTool && (
        <div className="border-t pt-6">
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">
              Detailed Comparison: {selectedTool.name}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-green-600">Pros</h4>
                <ul className="space-y-1 ml-4">
                  {selectedTool.pros.map((pro, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">✓</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-red-600">Cons</h4>
                <ul className="space-y-1 ml-4">
                  {selectedTool.cons.map((con, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-600 mr-2 mt-1">✗</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-medium">Overall Rating:</span>
                <div className="flex items-center">
                  <span className="text-2xl font-bold">{selectedTool.rating}</span>
                  <span className="text-muted-foreground ml-1">/5</span>
                </div>
              </div>
              <div className="mt-2 w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(selectedTool.rating / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}