"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";

interface DiffLine {
  type: "added" | "removed" | "unchanged" | "context";
  content: string;
  lineNum?: number;
  oldLineNum?: number;
  newLineNum?: number;
}

interface FileDiff {
  filename: string;
  changes: DiffLine[];
  added: number;
  removed: number;
}

interface VersionDiffProps {
  diffs: FileDiff[];
  className?: string;
  title?: string;
}

export function VersionDiff({ diffs, className, title }: VersionDiffProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  const toggleFile = (filename: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(filename)) {
      newExpanded.delete(filename);
    } else {
      newExpanded.add(filename);
    }
    setExpandedFiles(newExpanded);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getLineClass = (type: DiffLine["type"]) => {
    switch (type) {
      case "added":
        return "bg-green-50 text-green-800";
      case "removed":
        return "bg-red-50 text-red-800";
      case "unchanged":
        return "bg-white";
      case "context":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-white";
    }
  };

  const getLinePrefix = (type: DiffLine["type"]) => {
    switch (type) {
      case "added":
        return "+";
      case "removed":
        return "-";
      case "context":
        return "...";
      default:
        return " ";
    }
  };

  return (
    <div className={className}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}

      <div className="space-y-4">
        {diffs.map((fileDiff, index) => {
          const isExpanded = expandedFiles.has(fileDiff.filename);
          const fileTotalLines = fileDiff.changes.length;

          return (
            <div key={index} className="border rounded-lg overflow-hidden">
              {/* File Header */}
              <div
                className="flex items-center justify-between bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleFile(fileDiff.filename)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="font-mono font-semibold text-sm">
                    {fileDiff.filename}
                  </span>
                  <span className="text-xs text-gray-500">
                    {fileTotalLines} lines
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {fileDiff.added > 0 && (
                    <span className="text-xs font-medium text-green-600">
                      +{fileDiff.added}
                    </span>
                  )}
                  {fileDiff.removed > 0 && (
                    <span className="text-xs font-medium text-red-600">
                      -{fileDiff.removed}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const fileContent = fileDiff.changes
                        .map(line => `${getLinePrefix(line.type)}${line.content}`)
                        .join("\n");
                      copyToClipboard(fileContent, `file-${index}`);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  {copied === `file-${index}` && (
                    <span className="text-xs text-green-600 animate-pulse">Copied!</span>
                  )}
                </div>
              </div>

              {/* File Content */}
              {isExpanded && (
                <div className="bg-white">
                  <div className="overflow-x-auto">
                    <div className="min-w-full inline-block align-middle">
                      <div className="divide-y">
                        {fileDiff.changes.map((line, lineIndex) => {
                          const isLongLine = line.content.length > 100;
                          const displayContent = isLongLine
                            ? line.content.substring(0, 100) + "..."
                            : line.content;
                          const lineId = `${fileDiff.filename}-${lineIndex}`;

                          return (
                            <div
                              key={lineIndex}
                              className={`flex font-mono text-xs ${getLineClass(line.type)}`}
                            >
                              {/* Line Numbers */}
                              <div className="flex flex-shrink-0 w-24 border-r border-gray-200">
                                <span className="w-8 text-right pr-2 text-gray-400">
                                  {line.oldLineNum ?? ""}
                                </span>
                                <span className="w-8 text-right pr-2 text-gray-400">
                                  {line.newLineNum ?? ""}
                                </span>
                              </div>

                              {/* Line Content */}
                              <div className="flex-1 px-4 py-1">
                                <span className="select-none mr-2 opacity-50">
                                  {getLinePrefix(line.type)}
                                </span>
                                <span>{displayContent}</span>
                                {isLongLine && (
                                  <button
                                    onClick={() => copyToClipboard(line.content, lineId)}
                                    className="ml-2 text-[10px] px-1 py-0.5 bg-gray-200 rounded hover:bg-gray-300"
                                    title="Copy full line"
                                  >
                                    {copied === lineId ? "✓" : "Copy"}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500" />
          <span>Added lines</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500" />
          <span>Removed lines</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-200" />
          <span>Context</span>
        </div>
      </div>
    </div>
  );
}