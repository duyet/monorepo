"use client";

import { useState } from "react";

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

/**
 * Tabs - Tabbed interface with underline indicator
 * Claude-style minimal design with simple border indicator
 */
export function Tabs({
  tabs,
  defaultTab,
  className = "",
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  if (!tabs || tabs.length === 0) {
    return (
      <div className={`text-base text-gray-500 dark:text-gray-400 ${className}`}>
        No tabs available
      </div>
    );
  }

  const activeTabContent = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className={className}>
      {/* Tab buttons */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-slate-800 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 text-base font-medium transition-colors relative ${
              activeTab === tab.id
                ? "text-gray-900 dark:text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTabContent && (
        <div className="prose dark:prose-invert prose-code:break-words max-w-none">
          {activeTabContent.content}
        </div>
      )}
    </div>
  );
}

export default Tabs;
