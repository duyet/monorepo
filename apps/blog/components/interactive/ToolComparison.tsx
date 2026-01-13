import { Card, CardContent, CardHeader, CardTitle } from "@duyet/components";
import { Star, StarHalf } from "lucide-react";

export interface ComparisonItem {
  name: string;
  pros: string[];
  cons: string[];
  rating: number; // 0-5
}

export interface ToolComparisonProps {
  title?: string;
  tools: ComparisonItem[];
}

/**
 * ToolComparison - Pros/cons with star ratings
 * Displays a comparison of tools with their advantages, disadvantages, and ratings
 */
export function ToolComparison({ title = "Tool Comparison", tools }: ToolComparisonProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-yellow-400 text-yellow-400 w-4 h-4" />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-yellow-400 text-yellow-400 w-4 h-4" />);
    }
    const remaining = 5 - stars.length;
    for (let i = 0; i < remaining; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300 dark:text-gray-600 w-4 h-4" />);
    }
    return stars;
  };

  return (
    <div className="my-6">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, idx) => (
          <Card key={idx} className="overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{tool.name}</CardTitle>
                <div className="flex items-center gap-1">{renderStars(tool.rating)}</div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">Pros</h4>
                  <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                    {tool.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Cons</h4>
                  <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                    {tool.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">✗</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}