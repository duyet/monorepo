import React from "react";

interface VersionDiffProps {
  oldVersion: string;
  newVersion: string;
  changes: Array<{
    type: "added" | "removed" | "modified";
    line: number;
    content: string;
  }>;
}

export const VersionDiff: React.FC<VersionDiffProps> = ({
  oldVersion,
  newVersion,
  changes
}) => {
  const getLineColor = (type: string) => {
    switch (type) {
      case "added": return "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700";
      case "removed": return "bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700";
      case "modified": return "bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700";
      default: return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  const getLineIndicator = (type: string) => {
    switch (type) {
      case "added": return "+";
      case "removed": return "-";
      case "modified": return "~";
      default: return " ";
    }
  };

  return (
    <div className="w-full mb-8">
      <h3 className="text-2xl font-bold mb-6 text-center">Version Diff</h3>
      <div className="flex justify-between items-center mb-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="font-medium">{oldVersion}</span>
        </div>
        <span className="text-gray-500 dark:text-gray-400">→</span>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="font-medium">{newVersion}</span>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="flex bg-gray-50 dark:bg-gray-900 border-b">
          <div className="w-12 p-2 text-center font-mono text-sm border-r">Line</div>
          <div className="flex-1 p-2 font-mono text-sm">Content</div>
        </div>
        {changes.map((change, index) => (
          <div
            key={index}
            className={`flex ${getLineColor(change.type)} border-b`}
          >
            <div className="w-12 p-2 text-center font-mono text-sm border-r">
              {change.line}
            </div>
            <div className="flex-1 p-2 font-mono text-sm flex items-center">
              <span className={`w-6 text-center mr-2 `
                + `${change.type === "added" ? "text-green-600 dark:text-green-400" : ""}`
                + `${change.type === "removed" ? "text-red-600 dark:text-red-400" : ""}`
                + `${change.type === "modified" ? "text-yellow-600 dark:text-yellow-400" : ""}`}
              >
                {getLineIndicator(change.type)}
              </span>
              <span className="flex-1">{change.content}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-3 space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
          <span className="text-sm">Added</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
          <span className="text-sm">Removed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
          <span className="text-sm">Modified</span>
        </div>
      </div>
    </div>
  );
};