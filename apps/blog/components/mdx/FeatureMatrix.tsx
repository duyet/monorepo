import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

interface Feature {
  name: string;
  description: string;
  scores: { [tool: string]: number };
}

interface FeatureMatrixProps {
  features: Feature[];
  tools: string[];
  title?: string;
}

export function FeatureMatrix({ features, tools, title = "Feature Matrix" }: FeatureMatrixProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const sortedFeatures = [...features];
  if (sortConfig !== null) {
    sortedFeatures.sort((a, b) => {
      if (sortConfig.key === "name") {
        return sortConfig.direction === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        const aValue = a.scores[sortConfig.key] || 0;
        const bValue = b.scores[sortConfig.key] || 0;
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
    });
  }

  const getScoreColor = (score: number) => {
    if (score >= 9) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    if (score >= 7) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
    if (score >= 5) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
  };

  const getScoreShape = (score: number) => {
    if (score >= 9) return "rounded-full";
    if (score >= 7) return "rounded-lg";
    return "rounded";
  };

  return (
    <div className="my-6">
      {title && <h3 className="text-2xl font-bold mb-4">{title}</h3>}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSortConfig(sortConfig?.key === "name"
                  ? { key: "name", direction: sortConfig.direction === "asc" ? "desc" : "asc" }
                  : { key: "name", direction: "asc" })}
              >
                Feature {sortConfig?.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Description</TableHead>
              {tools.map((tool) => (
                <TableHead
                  key={tool}
                  className="cursor-pointer hover:bg-muted/50 text-center"
                  onClick={() => setSortConfig(sortConfig?.key === tool
                    ? { key: tool, direction: sortConfig.direction === "asc" ? "desc" : "asc" }
                    : { key: tool, direction: "asc" })}
                >
                  {tool} {sortConfig?.key === tool && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedFeatures.map((feature, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{feature.name}</TableCell>
                <TableCell>{feature.description}</TableCell>
                {tools.map((tool) => {
                  const score = feature.scores[tool] || 0;
                  return (
                    <TableCell key={tool} className="text-center">
                      <div className={`inline-flex items-center justify-center w-8 h-8 ${getScoreColor(score)} ${getScoreShape(score)}`}>
                        <span className="font-semibold">{score}</span>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}