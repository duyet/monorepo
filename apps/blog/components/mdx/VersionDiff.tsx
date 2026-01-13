import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, GitDiff, Plus, Minus } from "lucide-react";

interface DiffLine {
  type: "added" | "removed" | "context";
  oldLine?: number;
  newLine?: number;
  content: string;
}

interface FileDiff {
  filename: string;
  lines: DiffLine[];
  additions: number;
  deletions: number;
}

interface VersionDiffProps {
  diffs: FileDiff[];
  title?: string;
}

export function VersionDiff({ diffs, title = "Version Diff" }: VersionDiffProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const toggleFile = (filename: string) => {
    setExpandedFiles((current) => {
      const newSet = new Set(current);
      if (newSet.has(filename)) {
        newSet.delete(filename);
      } else {
        newSet.add(filename);
      }
      return newSet;
    });
  };

  const getLineClass = (type: string) => {
    switch (type) {
      case "added":
        return "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
      case "removed":
        return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
      default:
        return "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  const getLineIcon = (type: string) => {
    switch (type) {
      case "added":
        return <Plus size={14} className="text-green-600" />;
      case "removed":
        return <Minus size={14} className="text-red-600" />;
      default:
        return <span className="text-gray-400">|</span>;
    }
  };

  return (
    <div className="my-6">
      {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
      <div className="space-y-2">
        {diffs.map((file, fileIndex) => (
          <motion.div
            key={file.filename}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: fileIndex * 0.05 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleFile(file.filename)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-500">
                  {expandedFiles.has(file.filename) ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </span>
                <GitDiff size={16} className="text-blue-500" />
                <span className="font-mono font-semibold text-sm">
                  {file.filename}
                </span>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-green-600">+{file.additions}</span>
                <span className="text-red-600">-{file.deletions}</span>
              </div>
            </button>

            <AnimatePresence>
              {expandedFiles.has(file.filename) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="font-mono text-xs">
                    {file.lines.map((line, lineIndex) => (
                      <div
                        key={lineIndex}
                        className={`flex ${getLineClass(line.type)} border-b border-gray-100 dark:border-gray-800 last:border-b-0`}
                      >
                        <div className="w-12 flex-shrink-0 text-right pr-2 py-1 opacity-60 select-none">
                          {line.oldLine || ""}
                        </div>
                        <div className="w-12 flex-shrink-0 text-right pr-2 py-1 opacity-60 select-none">
                          {line.newLine || ""}
                        </div>
                        <div className="w-6 flex-shrink-0 flex justify-center py-1">
                          {getLineIcon(line.type)}
                        </div>
                        <div className="flex-1 px-2 py-1 whitespace-pre-wrap break-all">
                          {line.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <Plus size={12} className="text-green-600" />
            <span>Added line</span>
          </span>
          <span className="flex items-center gap-1">
            <Minus size={12} className="text-red-600" />
            <span>Removed line</span>
          </span>
        </div>
        <div className="text-xs opacity-70">
          Click filenames to expand/collapse full diff
        </div>
      </div>
    </div>
  );
}