import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@duyet/components/ui/card';
import { Badge } from '@duyet/components/ui/badge';
import { cn } from '@duyet/libs/utils';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  line?: number;
}

interface VersionDiffProps {
  from: string;
  to: string;
  lines: DiffLine[];
  title?: string;
}

export function VersionDiff({ from, to, lines, title }: VersionDiffProps) {
  const getLineClass = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800';
      case 'removed':
        return 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800';
    }
  };

  const getLineNumberClass = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return 'text-green-600 dark:text-green-400';
      case 'removed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getPrefix = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return '+';
      case 'removed':
        return '-';
      default:
        return ' ';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-4">
          <span>{title || 'Version Diff'}</span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {from}
            </Badge>
            <span>→</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {to}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-sm rounded-lg overflow-hidden border">
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm">Diff</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center space-x-1">
                <span className="text-green-600">+</span>
                <span>Added</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="text-red-600">-</span>
                <span>Removed</span>
              </span>
            </div>
          </div>

          <div className="divide-y">
            {lines.map((line, index) => (
              <div
                key={index}
                className={cn(
                  "flex transition-colors",
                  getLineClass(line.type)
                )}
              >
                <div className={cn(
                  "w-12 px-3 text-right select-none",
                  getLineNumberClass(line.type)
                )}>
                  {line.line && `${line.line.toString().padStart(4, '0)')}`}
                </div>
                <div className={cn(
                  "w-12 px-3 text-center select-none",
                  getLineNumberClass(line.type)
                )}>
                  {getPrefix(line.type)}
                </div>
                <div className="flex-1 px-3">
                  {line.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}