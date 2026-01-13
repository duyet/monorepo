"use client";

import { useState } from "react";
import { Star, StarHalf, XCircle, CheckCircle } from "lucide-react";
import { cn } from "@duyet/libs/utils";

interface Tool {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  rating: number;
}

interface ToolComparisonProps {
  tools: Tool[];
}

const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
  }

  if (hasHalfStar) {
    stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
  }

  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
  }

  return <div className="flex items-center gap-1">{stars}</div>;
};

export function ToolComparison({ tools }: ToolComparisonProps) {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  return (
    <div className="my-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, index) => (
          <div
            key={index}
            className={cn(
              "rounded-lg border bg-white p-6 transition-all hover:shadow-md cursor-pointer",
              selectedTool?.name === tool.name ? "ring-2 ring-blue-500" : ""
            )}
            onClick={() => setSelectedTool(tool)}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">{tool.name}</h3>
              <StarRating rating={tool.rating} />
            </div>
            <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
            <div className="space-y-2">
              {tool.pros.slice(0, 2).map((pro, i) => (
                <div key={`pro-${i}`} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{pro}</span>
                </div>
              ))}
              {tool.cons.slice(0, 2).map((con, i) => (
                <div key={`con-${i}`} className="flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <span>{con}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedTool && (
        <div className="mt-8 rounded-lg border bg-white p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-semibold">{selectedTool.name}</h3>
            <StarRating rating={selectedTool.rating} />
          </div>
          <p className="text-gray-600 mb-6">{selectedTool.description}</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Pros
              </h4>
              <ul className="space-y-2">
                {selectedTool.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Cons
              </h4>
              <ul className="space-y-2">
                {selectedTool.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}