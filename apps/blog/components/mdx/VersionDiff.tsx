import { useState } from "react";
import { ChevronDown, ChevronRight, GitBranch, GitCommit } from "lucide-react";

interface FileChange {
  filename: string;
  additions: number;
  deletions: number;
  changes: number;
  diff?: string;
}

interface VersionDiffProps {
  fromVersion: string;
  toVersion: string;
  changes: FileChange[];
  title?: string;
}

export function VersionDiff({ fromVersion, toVersion, changes, title = "Version Differences" }: VersionDiffProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const toggleFile = (filename: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(filename)) {
      newExpanded.delete(filename);
    } else {
      newExpanded.add(filename);
    }
    setExpandedFiles(newExpanded);
  };

  const totalAdditions = changes.reduce((sum, file) => sum + file.additions, 0);
  const totalDeletions = changes.reduce((sum, file) => sum + file.deletions, 0);

  return (
    <div className="my-6">
      {title && <h3 className="text-2xl font-bold mb-4">{title}</h3>}

      {/* Version header */}
      <div className="flex items-center gap-3 mb-4 text-sm">
        <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded font-mono">
          {fromVersion}
        </span>
        <GitBranch className="w-4 h-4 text-muted-foreground" />
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded font-mono">
          {toVersion}
        </span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            +{totalAdditions}
          </div>
          <div className="text-xs text-muted-foreground">Additions</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            -{totalDeletions}
          </div>
          <div className="text-xs text-muted-foreground">Deletions</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">
            {totalAdditions + totalDeletions}
          </div>
          <div className="text-xs text-muted-foreground">Total Changes</div>
        </div>
      </div>

      {/* File changes list */}
      <div className="space-y-2">
        {changes.map((file, idx) => {
          const isExpanded = expandedFiles.has(file.filename);

          return (
            <div key={idx} className="border rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors text-left"
                onClick={() => toggleFile(file.filename)}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <GitCommit className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-sm">{file.filename}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-green-600 dark:text-green-400 font-medium">+{file.additions}</span>
                  <span className="text-red-600 dark:text-red-400 font-medium">-{file.deletions}</span>
                </div>
              </button>

              {isExpanded && file.diff && (
                <div className="bg-gray-900 text-gray-100 p-3 text-xs font-mono overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{file.diff}</pre>
                </div>
              )}

              {isExpanded && !file.diff && (
                <div className="p-3 text-sm text-muted-foreground italic">
                  No detailed diff available
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Showing {changes.length} changed file(s)
      </div>
    </div>
  );
}