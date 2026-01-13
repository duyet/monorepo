import { useState } from "react";

export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineNo?: number;
}

export interface VersionDiffProps {
  title?: string;
  before: string;
  after: string;
  language?: string;
}

/**
 * VersionDiff - Git-style diff viewer
 * Shows changes between two versions of code with syntax highlighting
 */
export function VersionDiff({ title = "Version Diff", before, after, language = "text" }: VersionDiffProps) {
  const [showDiff, setShowDiff] = useState(true);

  // Generate diff (simple line-by-line comparison)
  const generateDiff = () => {
    const beforeLines = before.trim().split("\n");
    const afterLines = after.trim().split("\n");
    const maxLines = Math.max(beforeLines.length, afterLines.length);
    const diff: DiffLine[] = [];

    let beforeIdx = 0;
    let afterIdx = 0;

    while (beforeIdx < beforeLines.length || afterIdx < afterLines.length) {
      if (beforeIdx >= beforeLines.length) {
        // All remaining after lines are additions
        diff.push({ type: "added", content: afterLines[afterIdx] || "", lineNo: afterIdx + 1 });
        afterIdx++;
      } else if (afterIdx >= afterLines.length) {
        // All remaining before lines are removals
        diff.push({ type: "removed", content: beforeLines[beforeIdx] || "", lineNo: beforeIdx + 1 });
        beforeIdx++;
      } else if (beforeLines[beforeIdx] === afterLines[afterIdx]) {
        // Lines are the same
        diff.push({ type: "unchanged", content: beforeLines[beforeIdx], lineNo: beforeIdx + 1 });
        beforeIdx++;
        afterIdx++;
      } else {
        // Lines differ
        diff.push({ type: "removed", content: beforeLines[beforeIdx] || "", lineNo: beforeIdx + 1 });
        diff.push({ type: "added", content: afterLines[afterIdx] || "", lineNo: afterIdx + 1 });
        beforeIdx++;
        afterIdx++;
      }
    }

    return diff;
  };

  const diff = generateDiff();

  const getLineClass = (type: string) => {
    switch (type) {
      case "added":
        return "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-l-2 border-green-500";
      case "removed":
        return "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-l-2 border-red-500";
      case "unchanged":
        return "bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300";
      default:
        return "";
    }
  };

  const getSymbol = (type: string) => {
    switch (type) {
      case "added":
        return "+";
      case "removed":
        return "-";
      default:
        return " ";
    }
  };

  const codeBlocks = showDiff ? diff : null;

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">{title}</h3>
        <button
          onClick={() => setShowDiff(!showDiff)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          {showDiff ? "Hide Diff" : "Show Diff"}
        </button>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
          <div className="flex-1 p-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
            Before
          </div>
          <div className="flex-1 p-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            After
          </div>
        </div>

        {/* Content */}
        <div className="text-sm">
          {showDiff ? (
            <div className="font-mono">
              {codeBlocks?.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex whitespace-pre-wrap ${getLineClass(line.type)} px-4 py-1`}
                >
                  <span className="w-4 text-center opacity-50 mr-4 select-none">
                    {getSymbol(line.type)}
                  </span>
                  <span className="flex-1">{line.content}</span>
                </div>
              ))}
              {codeBlocks?.length === 0 && (
                <div className="p-4 text-center text-gray-500">No changes detected</div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
              <div className="font-mono">
                <div className="bg-red-50 dark:bg-red-900/10 p-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-red-600 dark:text-red-400 font-bold">ORIGINAL</span>
                </div>
                <div className="p-3">
                  {before.split("\n").map((line, idx) => (
                    <div key={idx} className="text-gray-700 dark:text-gray-300">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
              <div className="font-mono">
                <div className="bg-green-50 dark:bg-green-900/10 p-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-green-600 dark:text-green-400 font-bold">UPDATED</span>
                </div>
                <div className="p-3">
                  {after.split("\n").map((line, idx) => (
                    <div key={idx} className="text-gray-700 dark:text-gray-300">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-500 rounded-sm"></span> Added
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-500 rounded-sm"></span> Removed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-gray-300 rounded-sm"></span> Unchanged
        </span>
      </div>
    </div>
  );
}

export function VersionDiffMulti({ title = "Multi-File Diff", files }: {
  title?: string;
  files: Array<{ name: string; before: string; after: string; language?: string; }>;
}) {
  const [activeFile, setActiveFile] = useState(0);

  return (
    <div className="my-6">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {files.map((file, idx) => (
          <button
            key={idx}
            onClick={() => setActiveFile(idx)}
            className={`px-4 py-2 rounded-md text-sm whitespace-nowrap transition-colors ${
              activeFile === idx
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {file.name}
          </button>
        ))}
      </div>

      {files[activeFile] && (
        <VersionDiff
          title={files[activeFile].name}
          before={files[activeFile].before}
          after={files[activeFile].after}
          language={files[activeFile].language}
        />
      )}
    </div>
  );
}