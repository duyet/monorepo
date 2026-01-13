"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { cn } from "@duyet/libs/utils";

export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  line: number;
  content: string;
}

export interface DiffFile {
  path: string;
  oldVersion?: string;
  newVersion?: string;
  changes: DiffLine[];
}

export interface VersionDiffProps {
  files: DiffFile[];
  className?: string;
}

export function VersionDiff({ files, className }: VersionDiffProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set(files.map(f => f.path)));

  const toggleFile = (path: string) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const getLineClasses = (type: string) => {
    switch (type) {
      case "added":
        return "bg-green-50 border-l-4 border-green-500";
      case "removed":
        return "bg-red-50 border-l-4 border-red-500";
      default:
        return "bg-gray-50 border-l-4 border-transparent";
    }
  };

  const getLineColor = (type: string) => {
    switch (type) {
      case "added":
        return "text-green-700 bg-green-100";
      case "removed":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const getStats = (file: DiffFile) => {
    const added = file.changes.filter(c => c.type === "added").length;
    const removed = file.changes.filter(c => c.type === "removed").length;
    const total = file.changes.length;
    return { added, removed, total };
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      <h2 className="text-2xl font-bold mb-6">Version Differences</h2>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {files.map((file, index) => {
          const stats = getStats(file);
          return (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="font-medium truncate">{file.path}</span>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">+{stats.added}</span>
                  <span className="text-gray-500">added</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">-{stats.removed}</span>
                  <span className="text-gray-500">removed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900">{stats.total}</span>
                  <span className="text-gray-500">total changes</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Files List */}
      <div className="space-y-4">
        {files.map((file, fileIndex) => {
          const stats = getStats(file);
          const isExpanded = expandedFiles.has(file.path);

          return (
            <div key={fileIndex} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {/* File Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleFile(file.path)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{file.path}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {file.oldVersion && file.newVersion && (
                          <span>
                            {file.oldVersion} → {file.newVersion}
                          </span>
                        )}
                        <span>
                          {stats.added} added, {stats.removed} removed
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-1 rounded text-xs font-medium", getLineColor("added"))}>
                      +{stats.added}
                    </span>
                    <span className={cn("px-2 py-1 rounded text-xs font-medium", getLineColor("removed"))}>
                      -{stats.removed}
                    </span>
                  </div>
                </div>
              </div>

              {/* File Content */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    {/* Line Numbers */}
                    <div className="p-2 bg-gray-100 border-r border-gray-200 text-sm text-gray-500">
                      {file.changes.map((_, index) => (
                        <div key={index} className="h-6 flex items-center justify-center">
                          {index + 1}
                        </div>
                      ))}
                    </div>

                    {/* Old Content */}
                    <div className="p-2 bg-gray-50 border-r border-gray-200 text-sm font-mono">
                      {file.changes.map((line, index) => (
                        <div
                          key={index}
                          className="h-6 flex items-center px-2"
                          style={{
                            backgroundColor: line.type === "removed" ? "#fee2e2" : "transparent",
                            color: line.type === "removed" ? "#dc2626" : "#374151",
                          }}
                        >
                          {line.type === "removed" ? line.content : " "}
                        </div>
                      ))}
                    </div>

                    {/* New Content */}
                    <div className="p-2 text-sm font-mono">
                      {file.changes.map((line, index) => (
                        <div
                          key={index}
                          className="h-6 flex items-center px-2"
                          style={{
                            backgroundColor: line.type === "added" ? "#dcfce7" : "transparent",
                            color: line.type === "added" ? "#16a34a" : "#374151",
                          }}
                        >
                          {line.type === "added" ? line.content : " "}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-l-4 border-green-500"></div>
            <span className="text-sm">Added lines</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-l-4 border-red-500"></div>
            <span className="text-sm">Removed lines</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border-l-4 border-transparent"></div>
            <span className="text-sm">Unchanged lines</span>
          </div>
        </div>
      </div>
    </div>
  );
}