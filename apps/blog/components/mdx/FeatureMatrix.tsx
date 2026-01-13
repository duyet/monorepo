import React, { useState } from 'react';

export interface FeatureRow {
  feature: string;
  scores: { [key: string]: number };
  color?: string;
  shape?: string; // circle, square, star, triangle
}

export interface FeatureMatrixProps {
  headers: string[];
  rows: FeatureRow[];
  title?: string;
}

const getShapeElement = (shape: string = 'circle', score: number) => {
  const size = 12;
  const color = score >= 8 ? 'bg-green-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500';

  switch (shape) {
    case 'square':
      return <div className={`w-${size} h-${size} ${color} rounded`} />;
    case 'star':
      return <span className={color}>★</span>;
    case 'triangle':
      return <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[12px] ${color.replace('bg-', 'border-t-')}`} />;
    default: // circle
      return <div className={`w-${size} h-${size} ${color} rounded-full`} />;
  }
};

/**
 * FeatureMatrix - Sortable table with color and shape-coded scores
 */
export const FeatureMatrix: React.FC<FeatureMatrixProps> = ({
  headers,
  rows,
  title = 'Feature Matrix'
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (header: string) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== header) {
        return { key: header, direction: 'desc' };
      }
      if (prev.direction === 'desc') {
        return { key: header, direction: 'asc' };
      }
      return null;
    });
  };

  const sortedRows = [...rows].sort((a, b) => {
    if (!sortConfig) return 0;

    const aScore = a.scores[sortConfig.key] || 0;
    const bScore = b.scores[sortConfig.key] || 0;

    if (sortConfig.direction === 'asc') {
      return aScore - bScore;
    }
    return bScore - aScore;
  });

  const getScoreClass = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800';
    if (score >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="my-6 overflow-x-auto">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 p-2 text-left font-semibold">Feature</th>
            {headers.map((header) => (
              <th
                key={header}
                className="border border-gray-300 p-2 text-center font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort(header)}
              >
                {header}
                {sortConfig?.key === header && (
                  <span className="ml-1 text-xs">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 p-2 font-medium">
                <div className="flex items-center gap-2">
                  {row.shape && getShapeElement(row.shape, 8)}
                  {row.feature}
                </div>
              </td>
              {headers.map((header) => {
                const score = row.scores[header] || 0;
                return (
                  <td
                    key={header}
                    className={`border border-gray-300 p-2 text-center ${getScoreClass(score)}`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {row.shape && getShapeElement(row.shape, score)}
                      <span className="font-semibold">{score}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-500 mt-2">
        Click any column header to sort. Scores: 8+ (green), 5-7 (yellow), 1-4 (red)
      </p>
    </div>
  );
};