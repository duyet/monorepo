import React, { useState } from "react";
import { cn } from "@duyet/libs/utils";

export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  line?: number;
  oldLine?: number;
  newLine?: number;
}

export interface DiffHunk {
  header: string;
  lines: DiffLine[];
}

export interface VersionDiffProps {
  fileName: string;
  oldVersion?: string;
  newVersion: string;
  diff?: DiffHunk[];
  className?: string;
}

const DIFF_COLORS = {
  added: "bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  removed: "bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  unchanged: "bg-transparent",
};

export function VersionDiff({
  fileName,
  oldVersion,
  newVersion,
  diff,
  className,
}: VersionDiffProps) {
  const [showContext, setShowContext] = useState(true);

  // If diff is not provided, generate a simple diff
  const generateDiff = (): DiffHunk[] => {
    if (diff) return diff;

    const oldLines = oldVersion ? oldVersion.split("\n") : [];
    const newLines = newVersion.split("\n");

    const hunk: DiffHunk = {
      header: `@@ -1,${oldLines.length} +1,${newLines.length} @@`,
      lines: [],
    };

    const maxLines = Math.max(oldLines.length, newLines.length);

    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === newLine) {
        hunk.lines.push({
          type: "unchanged",
          content: oldLine || "",
          line: i + 1,
          oldLine: i + 1,
          newLine: i + 1,
        });
      } else {
        if (oldLine !== undefined) {
          hunk.lines.push({
            type: "removed",
            content: oldLine,
            oldLine: i + 1,
          });
        }
        if (newLine !== undefined) {
          hunk.lines.push({
            type: "added",
            content: newLine,
            newLine: i + 1,
          });
        }
      }
    }

    return [hunk];
  };

  const diffHunks = generateDiff();

  const getLineNumbers = (line: DiffLine) => {
    if (line.type === "unchanged") {
      return `${line.oldLine} | ${line.newLine}`;
    }
    if (line.type === "removed") {
      return `${line.oldLine} | -`;
    }
    return `- | ${line.newLine}`;
  };

  const addedLines = diffHunks.reduce(
    (sum, hunk) =>
      sum + hunk.lines.filter((line) => line.type === "added").length,
    0
  );
  const removedLines = diffHunks.reduce(
    (sum, hunk) =>
      sum + hunk.lines.filter((line) => line.type === "removed").length,
    0
  );

  return (
    <div className={cn("w-full max-w-5xl mx-auto space-y-4", className)}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold mb-1">{fileName}</h2>
          <p className="text-sm text-muted-foreground">
            Showing changes between versions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-3 text-sm">
            <span className="flex items-center gap-1">
              <span className="text-green-600 font-semibold">+{addedLines}</span>
              <span className="text-muted-foreground">additions</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-red-600 font-semibold">-{removedLines}</span>
              <span className="text-muted-foreground">deletions</span>
            </span>
          </div>

          <button
            onClick={() => setShowContext(!showContext)}
            className="px-3 py-1 text-sm rounded bg-muted hover:bg-muted/80"
          >
            {showContext ? "Hide" : "Show"} Context
          </button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden text-sm">
        {/* Header */}
        <div className="bg-muted/50 px-4 py-2 border-b font-mono">
          <div className="flex items-center gap-4">
            <span className="font-semibold">diff --git</span>
            <span className="text-muted-foreground">
              a/{fileName} b/{fileName}
            </span>
          </div>
        </div>

        {/* File content */}
        <div className="bg-white dark:bg-slate-950">
          {diffHunks.map((hunk, hunkIndex) => (
            <div key={hunkIndex}>
              {/* Hunk header */}
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-1 font-mono text-xs text-gray-600 dark:text-gray-400">
                {hunk.header}
              </div>

              {/* Lines */}
              {hunk.lines
                .filter(
                  (line) => showContext || line.type !== "unchanged"
                )
                .map((line, lineIndex) => {
                  const icon =
                    line.type === "added"
                      ? "+"
                      : line.type === "removed"
                      ? "-"
                      : " ";

                  return (
                    <div
                      key={lineIndex}
                      className={cn(
                        "flex font-mono",
                        DIFF_COLORS[line.type],
                        "hover:bg-opacity-50"
                      )}
                    >
                      <div className="w-12 px-2 py-1 text-right text-gray-400 select-none border-r border-gray-200 dark:border-gray-700">
                        {getLineNumbers(line)}
                      </div>
                      <div
                        className={cn(
                          "flex-1 px-3 py-1 whitespace-pre-wrap break-all",
                          line.type === "added" &&
                            "text-green-700 dark:text-green-400",
                          line.type === "removed" &&
                            "text-red-700 dark:text-red-400",
                          line.type === "unchanged" &&
                            "text-gray-700 dark:text-gray-300"
                        )}
                      >
                        <span className="opacity-50 mr-2">{icon}</span>
                        {line.content}
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      {/* Summary box */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {oldVersion && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="font-semibold mb-2">Old Version</div>
            <pre className="text-xs whitespace-pre-wrap font-mono opacity-70">
              {oldVersion.substring(0, 200)}
              {oldVersion.length > 200 ? "..." : ""}
            </pre>
          </div>
        )}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="font-semibold mb-2">New Version</div>
          <pre className="text-xs whitespace-pre-wrap font-mono opacity-70">
            {newVersion.substring(0, 200)}
            {newVersion.length > 200 ? "..." : ""}
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          onClick={() => alert("Copy functionality would be implemented here")}
        >
          Copy Diff
        </button>
        <button
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
          onClick={() => alert("Download functionality would be implemented here")}
        >
          Download Patch
        </button>
      </div>
    </div>
  );
}