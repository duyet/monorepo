import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Star } from "lucide-react";

interface Tool {
  name: string;
  pros: string[];
  cons: string[];
  rating: number;
}

interface ToolComparisonProps {
  tools: Tool[];
  title?: string;
}

export function ToolComparison({ tools, title = "Tool Comparison" }: ToolComparisonProps) {
  return (
    <div className="my-6">
      {title && <h3 className="text-2xl font-bold mb-4">{title}</h3>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, idx) => (
          <Card key={idx} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {tool.name}
                <span className="flex items-center text-sm text-muted-foreground">
                  {tool.rating}
                  <Star className="w-4 h-4 ml-1 fill-yellow-400 text-yellow-400" />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4" /> Pros
                  </h4>
                  <ul className="text-sm space-y-1 ml-6">
                    {tool.pros.map((pro, i) => (
                      <li key={i} className="text-green-700 dark:text-green-300">
                        • {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4" /> Cons
                  </h4>
                  <ul className="text-sm space-y-1 ml-6">
                    {tool.cons.map((con, i) => (
                      <li key={i} className="text-red-700 dark:text-red-300">
                        • {con}
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