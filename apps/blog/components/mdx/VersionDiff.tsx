interface DiffLine {
  oldLine?: number;
  newLine?: number;
  content: string;
  type: "added" | "removed" | "context" | "header";
}

interface VersionDiffProps {
  title: string;
  lines: DiffLine[];
  filename?: string;
}

export function VersionDiff({ title, lines, filename }: VersionDiffProps) {
  return (
    <div className="my-6 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden font-mono text-sm">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 font-semibold border-b border-gray-300 dark:border-gray-700">
        {filename ? `${title} - ${filename}` : title}
      </div>

      {/* Diff content */}
      <div className="overflow-x-auto">
        {lines.map((line, index) => {
          const baseClass = "px-4 py-1 flex gap-4 min-w-max";

          if (line.type === "header") {
            return (
              <div key={index} className={`${baseClass} bg-gray-50 dark:bg-gray-900 font-bold text-gray-600 dark:text-gray-400`}>
                <span className="w-12 text-right opacity-50">...</span>
                <span className="w-12 text-right opacity-50">...</span>
                <span>{line.content}</span>
              </div>
            );
          }

          if (line.type === "added") {
            return (
              <div key={index} className={`${baseClass} bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300`}>
                <span className="w-12 text-right opacity-50">
                  {line.oldLine ?? ""}
                </span>
                <span className="w-12 text-right font-semibold text-green-700 dark:text-green-400">
                  {line.newLine ?? ""}
                </span>
                <span className="pl-4 border-l-2 border-green-400">
                  <span className="select-none mr-2">+</span>
                  {line.content}
                </span>
              </div>
            );
          }

          if (line.type === "removed") {
            return (
              <div key={index} className={`${baseClass} bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300`}>
                <span className="w-12 text-right font-semibold text-red-700 dark:text-red-400">
                  {line.oldLine ?? ""}
                </span>
                <span className="w-12 text-right opacity-50">
                  {line.newLine ?? ""}
                </span>
                <span className="pl-4 border-l-2 border-red-400">
                  <span className="select-none mr-2">-</span>
                  {line.content}
                </span>
              </div>
            );
          }

          // Context lines
          return (
            <div key={index} className={`${baseClass} bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300`}>
              <span className="w-12 text-right opacity-50">
                {line.oldLine ?? ""}
              </span>
              <span className="w-12 text-right opacity-50">
                {line.newLine ?? ""}
              </span>
              <span className="pl-4 border-l-2 border-gray-300 dark:border-gray-700">
                <span className="select-none mr-2"> </span>
                {line.content}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to create standard git-style diffs
export function createGitDiff(
  filename: string,
  oldContent: string,
  newContent: string
): DiffLine[] {
  const oldLines = oldContent.split("\n");
  const newLines = newContent.split("\n");
  const result: DiffLine[] = [];

  result.push({ type: "header", content: `diff --git a/${filename} b/${filename}` });
  result.push({ type: "header", content: `--- a/${filename}` });
  result.push({ type: "header", content: `+++ b/${filename}` });

  let oldIdx = 0;
  let newIdx = 0;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    if (oldIdx < oldLines.length && newIdx < newLines.length && oldLines[oldIdx] === newLines[newIdx]) {
      // Context line
      result.push({
        oldLine: oldIdx + 1,
        newLine: newIdx + 1,
        content: oldLines[oldIdx],
        type: "context",
      });
      oldIdx++;
      newIdx++;
    } else if (oldIdx < oldLines.length && newIdx < newLines.length && oldLines[oldIdx] !== newLines[newIdx]) {
      // Try to find the next match (this is a simplified algorithm)
      const nextMatchInOld = oldLines.slice(oldIdx + 1).findIndex(l => l === newLines[newIdx]);
      const nextMatchInNew = newLines.slice(newIdx + 1).findIndex(l => l === oldLines[oldIdx]);

      if (nextMatchInNew === -1 || (nextMatchInOld !== -1 && nextMatchInOld < nextMatchInNew)) {
        // Removed line
        result.push({
          oldLine: oldIdx + 1,
          content: oldLines[oldIdx],
          type: "removed",
        });
        oldIdx++;
      } else {
        // Added line
        result.push({
          newLine: newIdx + 1,
          content: newLines[newIdx],
          type: "added",
        });
        newIdx++;
      }
    } else if (oldIdx < oldLines.length) {
      // Removed line
      result.push({
        oldLine: oldIdx + 1,
        content: oldLines[oldIdx],
        type: "removed",
      });
      oldIdx++;
    } else {
      // Added line
      result.push({
        newLine: newIdx + 1,
        content: newLines[newIdx],
        type: "added",
      });
      newIdx++;
    }
  }

  return result;
}