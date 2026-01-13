import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@duyet/components/ui/card';
import { cn } from '@duyet/libs/utils';

interface Tool {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  category: string;
}

interface ToolComparisonProps {
  tools: Tool[];
}

export function ToolComparison({ tools }: ToolComparisonProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">工具对比</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {tools.map((tool, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{tool.name}</span>
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                  {tool.category}
                </span>
              </CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-green-700 mb-2">优点</h3>
                <ul className="list-disc list-inside space-y-1">
                  {tool.pros.map((pro, idx) => (
                    <li key={idx} className="text-sm">{pro}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-red-700 mb-2">缺点</h3>
                <ul className="list-disc list-inside space-y-1">
                  {tool.cons.map((con, idx) => (
                    <li key={idx} className="text-sm">{con}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}