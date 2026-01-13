import React, { useState } from 'react';

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  content: string;
  line?: number;
  oldLine?: number;
  newLine?: number;
}

export interface VersionDiffProps {
  fileName: string;
  lines: DiffLine[];
  title?: string;
  showLineNumbers?: boolean;
}

/**
 * VersionDiff - Git-style diff viewer
 */
export const VersionDiff: React.FC<VersionDiffProps> = ({
  fileName,
  lines,
  title = 'Version Diff',
  showLineNumbers = true,
}) => {
  const [showAll, setShowAll] = useState(true);

  const filteredLines = showAll
    ? lines
    : lines.filter((line) => line.type !== 'unchanged');

  const getTypeColor = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 text-green-900';
      case 'removed':
        return 'bg-red-50 text-red-900';
      case 'modified':
        return 'bg-yellow-50 text-yellow-900';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };

  const getTypeSymbol = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return '+';
      case 'removed':
        return '-';
      case 'modified':
        return '~';
      default:
        return ' ';
    }
  };

  const getTypeLabel = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return 'Added';
      case 'removed':
        return 'Removed';
      case 'modified':
        return 'Modified';
      default:
        return 'Unchanged';
    }
  };

  // Count statistics
  const stats = lines.reduce(
    (acc, line) => {
      acc[line.type]++;
      return acc;
    },
    { added: 0, removed: 0, modified: 0, unchanged: 0 } as Record<string, number>
  );

  return (
    <div className="my-6">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>

      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-2 rounded-t-lg flex justify-between items-center flex-wrap gap-2">
        <div className="font-mono text-sm">{fileName}</div>
        <div className="flex gap-3 text-xs">
          <span className="text-green-400">+{stats.added}</span>
          <span className="text-red-400">-{stats.removed}</span>
          <span className="text-yellow-400">~{stats.modified}</span>
        </div>
      </div>

      {/* Stats toggle */}
      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center border-x border-gray-300">
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {showAll ? 'Hide unchanged lines' : 'Show all lines'}
        </button>
        <span className="text-xs text-gray-600">
          Showing {filteredLines.length} of {lines.length} lines
        </span>
      </div>

      {/* Diff content */}
      <div className="border-x border-b border-gray-300 rounded-b-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <pre className="text-sm font-mono">
            {filteredLines.map((line, idx) => (
              <div
                key={idx}
                className={`flex ${getTypeColor(line.type)} hover:bg-opacity-70 transition-colors`}
              >
                {/* Line numbers */}
                {showLineNumbers && (
                  <div className="flex-none w-16 px-2 py-1 text-gray-400 text-right select-none border-r border-gray-200">
                    {line.type === 'removed'
                      ? line.oldLine
                      : line.type === 'added'
                      ? line.newLine
                      : `${line.oldLine || ''}`}
                  </div>
                )}

                {/* Type marker */}
                <div className="flex-none w-6 px-2 py-1 font-bold text-center border-r border-gray-200">
                  {getTypeSymbol(line.type)}
                </div>

                {/* Content */}
                <div className="flex-1 px-2 py-1 whitespace-pre-wrap break-all">
                  {line.content}
                </div>
              </div>
            ))}
          </pre>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Legend: + Added, - Removed, ~ Modified, {showLineNumbers ? 'Line numbers show old/new offsets' : 'Enable line numbers in props'}
      </p>
    </div>
  );
};