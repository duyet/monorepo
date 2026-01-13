import React from "react";

interface DiffLine {
  line: string;
  type: "added" | "removed" | "unchanged";
  lineNumber?: number;
}

interface FileDiff {
  filename: string;
  lines: DiffLine[];
}

interface VersionDiffProps {
  title: string;
  diffs: FileDiff[];
}

/**
 * VersionDiff - Git-style diff viewer
 */
export const VersionDiff: React.FC<VersionDiffProps> = ({ title, diffs }) => {
  const getLineTypeColor = (type: string) => {
    switch (type) {
      case "added":
        return "bg-green-50 dark:bg-green-900/20";
      case "removed":
        return "bg-red-50 dark:bg-red-900/20";
      default:
        return "bg-white dark:bg-gray-900";
    }
  };

  const getLinePrefix = (type: string) => {
    switch (type) {
      case "added":
        return "+";
      case "removed":
        return "-";
      default:
        return " ";
    }
  };

  const getLineBorderColor = (type: string) => {
    switch (type) {
      case "added":
        return "border-l-4 border-green-500";
      case "removed":
        return "border-l-4 border-red-500";
      default:
        return "border-l-4 border-gray-300 dark:border-gray-600";
    }
  };

  const calculateStats = (lines: DiffLine[]) => {
    const added = lines.filter(l => l.type === "added").length;
    const removed = lines.filter(l => l.type === "removed").length;
    return { added, removed };
  };

  return (
    <div className="my-6">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="space-y-4">
        {diffs.map((diff, fileIdx) => {
          const stats = calculateStats(diff.lines);
          return (
            <div key={fileIdx} className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* File header */}
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-300 dark:border-gray-700">
                <div className="font-mono font-semibold text-sm">{diff.filename}</div>
                <div className="flex gap-3 text-xs">
                  {stats.added > 0 && (
                    <span className="text-green-600 dark:text-green-400">
                      +{stats.added}
                    </span>
                  )}
                  {stats.removed > 0 && (
                    <span className="text-red-600 dark:text-red-400">
                      -{stats.removed}
                    </span>
                  )}
                </div>
              </div>

              {/* Diff content */}
              <div className="text-sm font-mono">
                {diff.lines.map((line, lineIdx) => (
                  <div
                    key={lineIdx}
                    className={`flex border-b border-gray-200 dark:border-gray-800 last:border-b-0 ${getLineBorderColor(line.type)}`}
                  >
                    <div className={`w-12 text-right pr-2 py-1 text-gray-400 select-none ${getLineTypeColor(line.type)}`}>
                      {line.lineNumber || ""}
                    </div>
                    <div
                      className={`w-6 text-center py-1 select-none ${
                        line.type === "added" ? "text-green-600 dark:text-green-400" :
                        line.type === "removed" ? "text-red-600 dark:text-red-400" :
                        "text-gray-400"
                      }`}
                    >
                      {getLinePrefix(line.type)}
                    </div>
                    <div
                      className={`flex-1 py-1 px-2 overflow-x-auto ${getLineTypeColor(line.type)} ${
                        line.type === "added" ? "text-green-800 dark:text-green-200" :
                        line.type === "removed" ? "text-red-800 dark:text-red-200" :
                        "text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {line.line}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VersionDiff;