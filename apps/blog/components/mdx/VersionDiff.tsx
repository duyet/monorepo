import React from "react";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  line?: number;
}

interface VersionDiffProps {
  oldVersion?: string;
  newVersion?: string;
  lines: DiffLine[];
  showLineNumbers?: boolean;
  title?: string;
  language?: string;
}

/**
 * Git-style code diff viewer
 */
export const VersionDiff: React.FC<VersionDiffProps> = ({
  oldVersion = "v1.0.0",
  newVersion = "v1.1.0",
  lines,
  showLineNumbers = true,
  title = "Version Comparison",
  language = "text",
}) => {
  const getLineClass = (type: DiffLine["type"]) => {
    switch (type) {
      case "added":
        return "bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500";
      case "removed":
        return "bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500";
      case "unchanged":
        return "bg-gray-50 dark:bg-gray-800/50 border-l-4 border-gray-400";
      default:
        return "bg-gray-50 dark:bg-gray-800/50";
    }
  };

  const getLineNumberClass = (type: DiffLine["type"]) => {
    switch (type) {
      case "added":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      case "removed":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      case "unchanged":
        return "text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/50";
      default:
        return "text-gray-500 dark:text-gray-500";
    }
  };

  const getLineSymbol = (type: DiffLine["type"]) => {
    switch (type) {
      case "added":
        return "+";
      case "removed":
        return "-";
      case "unchanged":
        return " ";
      default:
        return " ";
    }
  };

  return (
    <div className="my-8 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-gray-600 dark:text-gray-400">{oldVersion}</span>
            </span>
            <span className="text-gray-400">→</span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-gray-600 dark:text-gray-400">{newVersion}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-green-50 dark:bg-green-900/30 border-l-2 border-green-500"></span>
            <span className="text-gray-600 dark:text-gray-400">Added</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-red-50 dark:bg-red-900/30 border-l-2 border-red-500"></span>
            <span className="text-gray-600 dark:text-gray-400">Removed</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-gray-50 dark:bg-gray-800/50 border-l-2 border-gray-400"></span>
            <span className="text-gray-600 dark:text-gray-400">Unchanged</span>
          </div>
        </div>
      </div>

      {/* Diff content */}
      <div className="bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto">
        <div className="flex">
          {/* Line numbers column */}
          {showLineNumbers && (
            <div className="select-none bg-gray-800 px-3 py-2 text-right">
              {lines.map((line, index) => (
                <div
                  key={index}
                  className={`h-6 leading-6 ${getLineNumberClass(line.type)}`}
                >
                  {line.line || index + 1}
                </div>
              ))}
            </div>
          )}

          {/* Content column */}
          <div className="flex-1">
            {lines.map((line, index) => (
              <div
                key={index}
                className={`h-6 leading-6 ${getLineClass(line.type)} pl-4 pr-2 ${
                  line.type !== "unchanged" ? "text-gray-100 dark:text-gray-200" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {getLineSymbol(line.type)} {line.content}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>
            Added: {lines.filter(l => l.type === "added").length} lines
          </span>
          <span>
            Removed: {lines.filter(l => l.type === "removed").length} lines
          </span>
          <span>
            Total: {lines.length} lines
          </span>
        </div>
      </div>
    </div>
  );
};

// Example usage component
export const VersionDiffExample: React.FC = () => {
  const exampleLines: DiffLine[] = [
    { type: "unchanged", content: "// Configuration file", line: 1 },
    { type: "unchanged", content: "", line: 2 },
    { type: "unchanged", content: "export const config = {", line: 3 },
    { type: "removed", content: "  apiKey: 'old-api-key-12345',", line: 4 },
    { type: "added", content: "  apiKey: 'new-api-key-67890',", line: 4 },
    { type: "unchanged", content: "  timeout: 5000,", line: 5 },
    { type: "unchanged", content: "  retries: 3,", line: 6 },
    { type: "removed", content: "  debug: false", line: 7 },
    { type: "added", content: "  debug: true", line: 7 },
    { type: "added", content: "  logging: true,", line: 8 },
    { type: "unchanged", content: "};", line: 9 },
    { type: "unchanged", content: "", line: 10 },
    { type: "unchanged", content: "// End of file", line: 11 },
  ];

  return (
    <div className="space-y-4">
      <VersionDiff
        oldVersion="v2.0.0"
        newVersion="v2.1.0"
        lines={exampleLines}
        title="Configuration Changes"
        language="javascript"
      />

      <VersionDiff
        oldVersion="v1.0.0"
        newVersion="v2.0.0"
        lines={[
          { type: "removed", content: "console.log('Hello, world!');", line: 1 },
          { type: "added", content: "console.log('Hello, MDX!');", line: 1 },
        ]}
        title="Simple Example"
        showLineNumbers={false}
      />
    </div>
  );
};