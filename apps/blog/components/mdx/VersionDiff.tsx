import * as React from "react";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineNumbers?: {
    old?: number;
    new?: number;
  };
}

interface VersionDiffProps {
  lines: DiffLine[];
  title?: string;
  filename?: string;
}

export function VersionDiff({ lines, title = "Version Diff", filename = "example.txt" }: VersionDiffProps) {
  return (
    <div className="my-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-hidden font-mono text-sm">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold m-0">{title}</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-2 py-1 rounded">
            {filename}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header */}
          <div className="flex border-b border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
            <div className="w-16 text-center py-1 text-xs font-semibold border-r border-gray-300 dark:border-gray-600">
              Line
            </div>
            <div className="w-16 text-center py-1 text-xs font-semibold border-r border-gray-300 dark:border-gray-600">
              Line
            </div>
            <div className="flex-1 py-1 text-xs font-semibold text-center">
              Changes
            </div>
          </div>

          {/* Diff lines */}
          {lines.map((line, index) => {
            const getBgColor = () => {
              switch (line.type) {
                case "added":
                  return "bg-green-50 dark:bg-green-900/20";
                case "removed":
                  return "bg-red-50 dark:bg-red-900/20";
                default:
                  return "bg-white dark:bg-gray-900";
              }
            };

            const getPrefix = () => {
              switch (line.type) {
                case "added":
                  return "+";
                case "removed":
                  return "-";
                default:
                  return " ";
              }
            };

            const getTextColor = () => {
              switch (line.type) {
                case "added":
                  return "text-green-800 dark:text-green-300";
                case "removed":
                  return "text-red-800 dark:text-red-300";
                default:
                  return "text-gray-800 dark:text-gray-300";
              }
            };

            return (
              <div
                key={index}
                className={`flex border-b border-gray-200 dark:border-gray-700 ${getBgColor()}`}
              >
                <div className="w-16 text-center py-1 border-r border-gray-300 dark:border-gray-600 text-xs text-gray-500">
                  {line.lineNumbers?.old ?? ""}
                </div>
                <div className="w-16 text-center py-1 border-r border-gray-300 dark:border-gray-600 text-xs text-gray-500">
                  {line.lineNumbers?.new ?? ""}
                </div>
                <div className={`flex-1 py-1 px-2 ${getTextColor()} whitespace-pre-wrap`}>
                  <span className="select-none opacity-50">{getPrefix()}</span>
                  {line.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-xs flex gap-3 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-500/30 border border-green-500"></span>
          Added
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-500/30 border border-red-500"></span>
          Removed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-gray-300/30 border border-gray-400"></span>
          Unchanged
        </span>
      </div>
    </div>
  );
}