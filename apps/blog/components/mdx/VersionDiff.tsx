"use client";

import { useState } from "react";
import { Minus, Plus, FileText } from "lucide-react";
import { cn } from "@duyet/libs/utils";

interface DiffLine {
  type: "removed" | "added" | "unchanged";
  content: string;
  lineNumber?: number;
}

interface VersionDiffProps {
  oldVersion: string;
  newVersion: string;
  fileName?: string;
  showLineNumbers?: boolean;
}

function parseDiff(oldContent: string, newContent: string): DiffLine[] {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  const diff: DiffLine[] = [];

  let i = 0, j = 0;
  let oldLineNum = 1;
  let newLineNum = 1;

  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      // Lines are the same
      diff.push({
        type: "unchanged",
        content: oldLines[i],
        lineNumber: oldLineNum
      });
      i++;
      j++;
      oldLineNum++;
      newLineNum++;
    } else if (i < oldLines.length && (j >= newLines.length || !newLines.slice(j).includes(oldLines[i]))) {
      // Line was removed
      diff.push({
        type: "removed",
        content: oldLines[i],
        lineNumber: oldLineNum
      });
      i++;
      oldLineNum++;
    } else if (j < newLines.length && (i >= oldLines.length || !oldLines.slice(i).includes(newLines[j]))) {
      // Line was added
      diff.push({
        type: "added",
        content: newLines[j],
        lineNumber: newLineNum
      });
      j++;
      newLineNum++;
    }
  }

  return diff;
}

export function VersionDiff({
  oldVersion,
  newVersion,
  fileName = "config.js",
  showLineNumbers = true
}: VersionDiffProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const diff = parseDiff(oldVersion, newVersion);

  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Version Comparison
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          {isExpanded ? "Show less" : "Show all changes"}
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-600">Old:</span>
            <span className="ml-2 font-mono text-sm">{oldVersion.substring(0, 30)}...</span>
          </div>
          <Minus className="h-4 w-4 text-gray-400" />
          <div className="text-sm">
            <span className="text-gray-600">New:</span>
            <span className="ml-2 font-mono text-sm">{newVersion.substring(0, 30)}...</span>
          </div>
        </div>

        <div className="bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto">
          <div className="flex">
            {showLineNumbers && (
              <div className="bg-gray-800 px-4 py-2 min-w-[60px] text-right text-gray-500 select-none">
                {diff.filter((_, i) => i % 2 === 0).map((_, i) => (
                  <div key={i} className="h-6 flex items-center justify-end pr-2">
                    {diff[i]?.lineNumber || '-'}
                  </div>
                ))}
              </div>
            )}
            <div className="flex-1">
              {diff.map((line, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-6 flex items-center px-4 border-l-2",
                    line.type === "removed" && "bg-red-900/20 border-red-500",
                    line.type === "added" && "bg-green-900/20 border-green-500",
                    line.type === "unchanged" && "border-transparent"
                  )}
                  style={{ minHeight: '24px' }}
                >
                  {showLineNumbers && (
                    <div className="text-gray-600 w-12 text-right pr-2 select-none">
                      {line.lineNumber || '-'}
                    </div>
                  )}
                  <div className="flex-1">
                    {line.type === "removed" && (
                      <Minus className="h-3 w-3 text-red-400 inline mr-2" />
                    )}
                    {line.type === "added" && (
                      <Plus className="h-3 w-3 text-green-400 inline mr-2" />
                    )}
                    {line.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!isExpanded && (
          <div className="p-4 bg-gray-50 border-t text-center">
            <button
              onClick={() => setIsExpanded(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Show all changes ({diff.filter(l => l.type !== 'unchanged').length} modifications)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}