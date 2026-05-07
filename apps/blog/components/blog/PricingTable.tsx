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
        className={`text-base text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55 ${className}`}
      >
        No pricing data available
      </div>
    );
  }

  return (
    <div
      className={`space-y-4 border-l-2 border-[#1a1a1a]/10 dark:border-white/10 pl-4 py-3 ${className}`}
    >
      {title && (
        <div className="space-y-1">
          <h2 className="text-lg font-medium text-[#1a1a1a] dark:text-[#f8f8f2]">
            {title}
          </h2>
          {description && (
            <p className="text-base text-[#1a1a1a]/70 dark:text-[#f8f8f2]/55">
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
            className="w-full text-left border border-[#1a1a1a]/10 dark:border-white/10 p-3 hover:bg-[#f7f7f7] dark:hover:bg-[#1a1a1a] transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-[#1a1a1a] dark:text-[#f8f8f2] text-base">
                  {row.model}
                </h3>
              </div>
              <span className="text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55 text-sm">
                {expandedRow === idx ? "−" : "+"}
              </span>
            </div>

            {expandedRow === idx && (
              <div className="mt-3 pt-3 border-t border-[#1a1a1a]/10 dark:border-white/10 space-y-2">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
                    Input:
                  </span>
                  <span className="text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70 font-medium">
                    {row.input}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
                    Output:
                  </span>
                  <span className="text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70 font-medium">
                    {row.output}
                  </span>
                </div>
                {row.note && (
                  <div className="mt-2 pt-2 border-t border-[#1a1a1a]/10 dark:border-white/10">
                    <p className="text-xs text-[#1a1a1a]/70 dark:text-[#f8f8f2]/55">
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
