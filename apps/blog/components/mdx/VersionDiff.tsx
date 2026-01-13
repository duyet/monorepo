interface DiffLine {
  type: 'added' | 'removed' | 'context';
  content: string;
  line?: number;
}

interface VersionDiffProps {
  oldVersion: string;
  newVersion: string;
  lines: DiffLine[];
  filename?: string;
}

export function VersionDiff({ oldVersion, newVersion, lines, filename = 'file.txt' }: VersionDiffProps) {
  return (
    <div className="my-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="flex bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1 px-4 py-2 text-sm font-mono text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
          v{oldVersion}
        </div>
        <div className="flex-1 px-4 py-2 text-sm font-mono text-gray-600 dark:text-gray-400">
          v{newVersion}
        </div>
      </div>
      <div className="font-mono text-xs md:text-sm">
        {lines.map((line, idx) => {
          const bgClass =
            line.type === 'added'
              ? 'bg-green-50 dark:bg-green-900/20'
              : line.type === 'removed'
              ? 'bg-red-50 dark:bg-red-900/20'
              : 'bg-white dark:bg-gray-900';
          const textClass =
            line.type === 'added'
              ? 'text-green-700 dark:text-green-300'
              : line.type === 'removed'
              ? 'text-red-700 dark:text-red-300'
              : 'text-gray-700 dark:text-gray-300';
          const prefix =
            line.type === 'added'
              ? '+'
              : line.type === 'removed'
              ? '-'
              : ' ';

          return (
            <div
              key={idx}
              className={`flex ${bgClass} px-4 py-1 border-b border-gray-100 dark:border-gray-800 last:border-0`}
            >
              <span className="w-8 text-gray-400 dark:text-gray-600 select-none text-right mr-4">
                {line.line ?? ''}
              </span>
              <span className={`${textClass} select-none mr-2`}>{prefix}</span>
              <span className="flex-1 break-all text-gray-800 dark:text-gray-200">
                {line.content}
              </span>
            </div>
          );
        })}
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        Git-style diff: <span className="text-green-600">+ added</span>, <span className="text-red-600">- removed</span>, normal = context
      </div>
    </div>
  );
}