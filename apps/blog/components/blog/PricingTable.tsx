"use client";

import { useState } from "react";

export interface PricingRow {
  model: string;
  input: string;
  output: string;
  note?: string;
}

export interface PricingTableProps {
  title?: string;
  description?: string;
  rows: PricingRow[];
  className?: string;
}

/**
 * PricingTable - Interactive pricing comparison table
 * Claude-style minimal design with left border and expandable rows
 */
export function PricingTable({
  title = "Pricing",
  description,
  rows,
  className = "",
}: PricingTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  if (!rows || rows.length === 0) {
    return (
      <div
        className={`text-base text-gray-500 dark:text-gray-400 ${className}`}
      >
        No pricing data available
      </div>
    );
  }

  return (
    <div
      className={`space-y-4 border-l-2 border-gray-300 dark:border-slate-700 pl-4 py-3 ${className}`}
    >
      {title && (
        <div className="space-y-1">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="text-base text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        {rows.map((row, idx) => (
          <button
            key={idx}
            onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
            className="w-full text-left border border-gray-200 dark:border-slate-800 p-3 hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white text-base">
                  {row.model}
                </h3>
              </div>
              <span className="text-gray-400 dark:text-gray-600 text-sm">
                {expandedRow === idx ? "−" : "+"}
              </span>
            </div>

            {expandedRow === idx && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Input:
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {row.input}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Output:
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {row.output}
                  </span>
                </div>
                {row.note && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {row.note}
                    </p>
                  </div>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PricingTable;
