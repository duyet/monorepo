import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface FeatureRow {
  feature: string;
  tool1: number;
  tool2: number;
  tool3: number;
}

interface FeatureMatrixProps {
  data: FeatureRow[];
  tools?: string[];
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'bg-green-500 text-white';
  if (score >= 6) return 'bg-yellow-500 text-white';
  if (score >= 4) return 'bg-orange-500 text-white';
  return 'bg-red-500 text-white';
}

function getScoreShape(score: number): string {
  if (score >= 8) return '●●●●●';
  if (score >= 6) return '●●●●○';
  if (score >= 4) return '●●●○○';
  if (score >= 2) return '●●○○○';
  return '●○○○○';
}

export function FeatureMatrix({ data, tools = ['Tool 1', 'Tool 2', 'Tool 3'] }: FeatureMatrixProps) {
  const [sortBy, setSortBy] = useState<'feature' | 'tool1' | 'tool2' | 'tool3'>('feature');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    const comparison = aVal > bVal ? 1 : -1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (column: 'feature' | 'tool1' | 'tool2' | 'tool3') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-sm border border-gray-200 dark:border-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th
              className="p-3 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => handleSort('feature')}
            >
              <div className="flex items-center gap-2">
                Feature
                {sortBy === 'feature' && <ChevronUp size={14} className={sortDirection === 'desc' ? 'rotate-180' : ''} />}
              </div>
            </th>
            {[tools[0], tools[1], tools[2]].map((tool, idx) => (
              <th
                key={idx}
                className="p-3 text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => handleSort(['tool1', 'tool2', 'tool3'][idx] as any)}
              >
                <div className="flex items-center justify-center gap-2">
                  {tool}
                  {sortBy === ['tool1', 'tool2', 'tool3'][idx] && (
                    <ChevronUp size={14} className={sortDirection === 'desc' ? 'rotate-180' : ''} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}>
              <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{row.feature}</td>
              {[row.tool1, row.tool2, row.tool3].map((score, colIdx) => (
                <td key={colIdx} className="p-3 text-center">
                  <div className={`inline-block px-2 py-1 rounded font-bold ${getScoreColor(score)}`}>
                    {score} {getScoreShape(score)}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Click headers to sort • Score + shape coding: 8+ = green, 6+ = yellow, 4+ = orange, <4 = red
      </div>
    </div>
  );
}