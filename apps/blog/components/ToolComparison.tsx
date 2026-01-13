"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@duyet/components";
import { Star, StarOff } from "lucide-react";

interface Tool {
  name: string;
  description: string;
  rating: number;
  pros: string[];
  cons: string[];
  features?: string[];
}

interface ToolComparisonProps {
  tools: Tool[];
  className?: string;
}

export function ToolComparison({ tools, className }: ToolComparisonProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          i < rating ? (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ) : (
            <StarOff key={i} className="h-4 w-4 text-gray-300" />
          )
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card
            key={tool.name}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedTool === tool.name ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setSelectedTool(selectedTool === tool.name ? null : tool.name)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {tool.name}
                <span className="text-sm font-normal text-gray-500">
                  {renderStars(tool.rating)}
                </span>
              </CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Pros</h4>
                <ul className="space-y-1">
                  {tool.pros.map((pro, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="text-green-500 mr-2">✓</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Cons</h4>
                <ul className="space-y-1">
                  {tool.cons.map((con, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="text-red-500 mr-2">✗</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
              {tool.features && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Key Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {tool.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {selectedTool && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Tool Details</h3>
          <p className="text-sm text-gray-600">
            Click on a tool card above to see detailed comparison features.
          </p>
        </div>
      )}
    </div>
  );
}