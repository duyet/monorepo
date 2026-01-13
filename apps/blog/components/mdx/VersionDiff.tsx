"use client";

import { useState } from "react";
import { GitBranch, GitCommit, Copy, Check } from "lucide-react";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineNumbers?: {
    old?: number;
    new?: number;
  };
}

interface Version {
  name: string;
  sha: string;
  date: string;
  author: string;
}

interface VersionDiffProps {
  oldVersion: Version;
  newVersion: Version;
  diffLines: DiffLine[];
  title?: string;
}

export function VersionDiff({ oldVersion, newVersion, diffLines, title = "Version Diff" }: VersionDiffProps) {
  const [copied, setCopied] = useState(false);

  const formatSha = (sha: string) => sha.slice(0, 7);
  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const copyDiff = () => {
    const diffText = diffLines
      .map(line => {
        if (line.type === "added") return `+${line.content}`;
        if (line.type === "removed") return `-${line.content}`;
        return ` ${line.content}`;
      })
      .join("\n");

    navigator.clipboard.writeText(diffText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        <button
          onClick={copyDiff}
          className="flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
          <span>{copied ? "Copied!" : "Copy Diff"}</span>
        </button>
      </div>

      {/* Version Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-red-200 dark:border-red-900 p-4 bg-red-50 dark:bg-red-950/30">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="font-semibold text-red-800 dark:text-red-300">Old Version</span>
          </div>
          <div className="text-sm space-y-1 text-red-700 dark:text-red-200">
            <div className="font-mono">{formatSha(oldVersion.sha)}</div>
            <div>{oldVersion.name}</div>
            <div className="text-xs">{formatDate(oldVersion.date)} by {oldVersion.author}</div>
          </div>
        </div>

        <div className="rounded-lg border border-green-200 dark:border-green-900 p-4 bg-green-50 dark:bg-green-950/30">
          <div className="flex items-center gap-2 mb-2">
            <GitCommit className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-800 dark:text-green-300">New Version</span>
          </div>
          <div className="text-sm space-y-1 text-green-700 dark:text-green-200">
            <div className="font-mono">{formatSha(newVersion.sha)}</div>
            <div>{newVersion.name}</div>
            <div className="text-xs">{formatDate(newVersion.date)} by {newVersion.author}</div>
          </div>
        </div>
      </div>

      {/* Diff Display */}
      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            File Changes ({diffLines.filter(l => l.type !== "unchanged").length} lines modified)
          </span>
        </div>

        <div className="font-mono text-sm max-h-96 overflow-y-auto">
          {diffLines.map((line, index) => {
            const getLineColor = () => {
              switch (line.type) {
                case "added":
                  return "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300";
                case "removed":
                  return "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300";
                default:
                  return "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300";
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

            return (
              <div
                key={index}
                className={`flex border-b border-gray-100 dark:border-gray-800 ${getLineColor()}`}
              >
                <div className="w-12 text-right px-2 py-1 border-r border-gray-200 dark:border-gray-700 text-gray-400 select-none">
                  {line.lineNumbers?.old ?? ""}
                </div>
                <div className="w-12 text-right px-2 py-1 border-r border-gray-200 dark:border-gray-700 text-gray-400 select-none">
                  {line.lineNumbers?.new ?? ""}
                </div>
                <div className="px-2 py-1 whitespace-pre-wrap break-all flex-1">
                  <span className="opacity-50 select-none mr-1">{getPrefix()}</span>
                  {line.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-sm"></span>
          <span>Added</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-sm"></span>
          <span>Removed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-500 rounded-sm"></span>
          <span>Unchanged</span>
        </div>
      </div>
    </div>
  );
}