"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Minus, Copy } from "lucide-react";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineNum: number;
}

interface FileDiff {
  filename: string;
  lines: DiffLine[];
  additions: number;
  deletions: number;
}

interface VersionDiffProps {
  files: FileDiff[];
  collapsed?: boolean;
}

export function VersionDiff({ files, collapsed = true }: VersionDiffProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(
    new Set(collapsed ? [] : files.map((f) => f.filename))
  );

  const toggleFile = (filename: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(filename)) {
      newExpanded.delete(filename);
    } else {
      newExpanded.add(filename);
    }
    setExpandedFiles(newExpanded);
  };

  const copyLine = (line: DiffLine) => {
    navigator.clipboard.writeText(line.content);
  };

  return (
    <div className="my-6 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden font-mono text-sm">
      {files.map((file) => {
        const isExpanded = expandedFiles.has(file.filename);
        const lineCount = file.lines.length;

        return (
          <div key={file.filename} className="border-b border-gray-300 dark:border-gray-700 last:border-b-0">
            {/* File header */}
            <div
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => toggleFile(file.filename)}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <span className="font-semibold">{file.filename}</span>
                <span className="text-xs text-gray-500">({lineCount} lines)</span>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-green-600">+{file.additions}</span>
                <span className="text-red-600">-{file.deletions}</span>
              </div>
            </div>

            {/* Diff content */}
            {isExpanded && (
              <div className="border-t border-gray-300 dark:border-gray-700">
                {file.lines.map((line, idx) => {
                  const bgColor =
                    line.type === "added"
                      ? "bg-green-50 dark:bg-green-900/20"
                      : line.type === "removed"
                      ? "bg-red-50 dark:bg-red-900/20"
                      : "bg-white dark:bg-gray-900";
                  const textColor =
                    line.type === "added"
                      ? "text-green-700 dark:text-green-400"
                      : line.type === "removed"
                      ? "text-red-700 dark:text-red-400"
                      : "text-gray-700 dark:text-gray-300";

                  return (
                    <div
                      key={idx}
                      className={`flex border-b border-gray-200 dark:border-gray-800 hover:bg-opacity-50 ${bgColor}`}
                    >
                      {/* Line numbers */}
                      <div className="w-8 flex-shrink-0 text-right pr-2 text-gray-400 select-none border-r border-gray-300 dark:border-gray-700">
                        {line.type === "unchanged" && line.lineNum}
                      </div>
                      <div className="w-8 flex-shrink-0 text-right pr-2 text-gray-400 select-none border-r border-gray-300 dark:border-gray-700">
                        {/* Placeholder for second line number in real git diff */}
                      </div>

                      {/* Change indicator */}
                      <div className="w-6 flex-shrink-0 text-center select-none">
                        {line.type === "added" && <Plus className="w-3 h-3 inline text-green-600" />}
                        {line.type === "removed" && <Minus className="w-3 h-3 inline text-red-600" />}
                      </div>

                      {/* Content */}
                      <div
                        className={`flex-1 px-3 py-0.5 overflow-x-auto ${textColor} relative group`}
                      >
                        <span>{line.content}</span>

                        {/* Copy button (appears on hover) */}
                        <button
                          onClick={() => copyLine(line)}
                          className="absolute right-0 top-0 bottom-0 opacity-0 group-hover:opacity-100 bg-gray-800 text-white px-2 text-xs flex items-center gap-1 transition-opacity hover:bg-gray-700"
                          title="Copy line"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}