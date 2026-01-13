"use client";

import { Minus, Plus } from "lucide-react";

interface DiffLine {
  type: "added" | "removed" | "unchanged" | "modified";
  content: string;
  line?: number;
}

interface VersionDiffProps {
  oldVersion: string;
  newVersion: string;
  diffs: DiffLine[];
  title?: string;
  description?: string;
}

const getDiffStyle = (type: DiffLine["type"]) => {
  switch (type) {
    case "added":
      return "bg-green-50 border-green-200";
    case "removed":
      return "bg-red-50 border-red-200";
    case "modified":
      return "bg-yellow-50 border-yellow-200";
    case "unchanged":
      return "bg-gray-50 border-gray-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

const getDiffIcon = (type: DiffLine["type"]) => {
  switch (type) {
    case "added":
      return <Plus className="w-4 h-4 text-green-600" />;
    case "removed":
      return <Minus className="w-4 h-4 text-red-600" />;
    case "modified":
      return <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>;
    case "unchanged":
      return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    default:
      return null;
  }
};

export function VersionDiff({
  oldVersion,
  newVersion,
  diffs,
  title,
  description,
}: VersionDiffProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {title || "Version Changes"}
        </h2>
        {description && <p className="text-gray-600">{description}</p>}
        <div className="flex items-center justify-center space-x-4 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium">{oldVersion}</span>
          </div>
          <div className="text-gray-400">→</div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">{newVersion}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 border-b">
          <div className="col-span-1">Type</div>
          <div className="col-span-1">Line</div>
          <div className="col-span-10">Content</div>
        </div>

        {/* Diff content */}
        <div className="font-mono text-sm">
          {diffs.map((diff, index) => (
            <div
              key={index}
              className={`grid grid-cols-12 gap-4 px-4 py-2 border-b ${getDiffStyle(diff.type)}`}
            >
              <div className="col-span-1 flex items-center">
                {getDiffIcon(diff.type)}
              </div>
              <div className="col-span-1 text-gray-500 font-mono text-xs">
                {diff.line || ""}
              </div>
              <div className="col-span-10">
                <code className="text-gray-800">{diff.content}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center mt-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm">Added</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm">Removed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-sm">Modified</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <span className="text-sm">Unchanged</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {diffs.filter((d) => d.type === "added").length}
          </div>
          <div className="text-sm text-green-700">Added</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">
            {diffs.filter((d) => d.type === "removed").length}
          </div>
          <div className="text-sm text-red-700">Removed</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {diffs.filter((d) => d.type === "modified").length}
          </div>
          <div className="text-sm text-yellow-700">Modified</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-600">
            {diffs.filter((d) => d.type === "unchanged").length}
          </div>
          <div className="text-sm text-gray-700">Unchanged</div>
        </div>
      </div>
    </div>
  );
}
