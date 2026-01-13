import React, { useState } from "react";

interface DiffLine {
  line: string;
  type: "added" | "removed" | "context";
  lineNumber?: number;
  oldLine?: number;
  newLine?: number;
}

interface VersionDiffProps {
  oldVersion: string;
  newVersion: string;
  /**
   * Unified diff output (optional - will auto-generate if not provided)
   */
  diff?: string;
  /**
   * Title for the diff viewer
   */
  title?: string;
}

/**
 * Generate a simple line-by-line diff between two strings
 * This is a basic implementation for demonstration
 */
function generateDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const diff: DiffLine[] = [];
  let oldLineNum = 1;
  let newLineNum = 1;
  let i = 0;
  let j = 0;

  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      // Context line
      diff.push({
        line: newLines[j],
        type: "context",
        oldLine: oldLineNum,
        newLine: newLineNum,
      });
      i++;
      j++;
      oldLineNum++;
      newLineNum++;
    } else if (j < newLines.length && !oldLines.includes(newLines[j])) {
      // Added line
      diff.push({
        line: newLines[j],
        type: "added",
        newLine: newLineNum,
      });
      j++;
      newLineNum++;
    } else if (i < oldLines.length) {
      // Removed line
      diff.push({
        line: oldLines[i],
        type: "removed",
        oldLine: oldLineNum,
      });
      i++;
      oldLineNum++;
    } else {
      break;
    }
  }

  return diff;
}

/**
 * VersionDiff Component
 * Displays a git-style diff viewer with line numbers
 */
export const VersionDiff: React.FC<VersionDiffProps> = ({
  oldVersion,
  newVersion,
  diff: providedDiff,
  title = "Version Diff",
}) => {
  const [showContext, setShowContext] = useState(true);

  // Generate diff lines
  const diffLines = providedDiff
    ? // Parse provided diff (simplified parsing)
      providedDiff.split("\n").map((line): DiffLine => {
        if (line.startsWith("+")) {
          return { line: line.slice(1), type: "added", newLine: 0 };
        }
        if (line.startsWith("-")) {
          return { line: line.slice(1), type: "removed", oldLine: 0 };
        }
        return { line, type: "context" };
      })
    : generateDiff(oldVersion, newVersion);

  // Filter context lines if hidden
  const filteredLines = showContext
    ? diffLines
    : diffLines.filter((l) => l.type !== "context");

  const getLineClass = (type: string) => {
    switch (type) {
      case "added":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
      case "removed":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
      default:
        return "bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300";
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

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">{title}</h3>
        <button
          onClick={() => setShowContext(!showContext)}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {showContext ? "Hide Context" : "Show Context"}
        </button>
      </div>

      <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden text-sm font-mono">
        {/* Header */}
        <div className="flex bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
          <div className="w-16 p-2 font-semibold text-center border-r border-gray-300 dark:border-gray-700">
            Old
          </div>
          <div className="w-16 p-2 font-semibold text-center border-r border-gray-300 dark:border-gray-700">
            New
          </div>
          <div className="flex-1 p-2 font-semibold">Content</div>
        </div>

        {/* Diff Lines */}
        <div className="max-h-96 overflow-y-auto">
          {filteredLines.map((line, index) => (
            <div
              key={index}
              className={`flex ${getLineClass(line.type)} border-b border-gray-200 dark:border-gray-800 last:border-b-0`}
            >
              <div className="w-16 p-2 text-right border-r border-gray-300 dark:border-gray-700 opacity-60">
                {line.oldLine || ""}
              </div>
              <div className="w-16 p-2 text-right border-r border-gray-300 dark:border-gray-700 opacity-60">
                {line.newLine || ""}
              </div>
              <div className="flex-1 p-2 whitespace-pre-wrap break-all">
                <span className="opacity-60 mr-2 select-none">
                  {getLinePrefix(line.type)}
                </span>
                {line.line}
              </div>
            </div>
          ))}

          {filteredLines.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No differences found or all context lines hidden
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-3 flex gap-4 text-sm">
        <span className="text-green-600 dark:text-green-400">
          +{diffLines.filter((l) => l.type === "added").length} lines added
        </span>
        <span className="text-red-600 dark:text-red-400">
          -{diffLines.filter((l) => l.type === "removed").length} lines removed
        </span>
        <span className="text-gray-600 dark:text-gray-400">
          ={diffLines.filter((l) => l.type === "context").length} lines unchanged
        </span>
      </div>
    </div>
  );
};
