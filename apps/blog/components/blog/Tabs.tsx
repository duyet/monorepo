"use client";

import { useCallback, useRef, useState } from "react";

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
export function Tabs({ tabs, defaultTab, className = "" }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  if (!tabs || tabs.length === 0) {
    return (
      <div
        className={`text-base text-gray-500 dark:text-gray-400 ${className}`}
      >
        No tabs available
      </div>
    );
  }

  const activeTabContent = tabs.find((tab) => tab.id === activeTab);
  const tablistRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = tabs.findIndex((t) => t.id === activeTab);
      let nextIndex = currentIndex;

      if (e.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        nextIndex = 0;
      } else if (e.key === "End") {
        nextIndex = tabs.length - 1;
      } else {
        return;
      }

      e.preventDefault();
      setActiveTab(tabs[nextIndex].id);
      const btn = tablistRef.current?.querySelector<HTMLButtonElement>(
        `#tab-${tabs[nextIndex].id}`
      );
      btn?.focus();
    },
    [activeTab, tabs]
  );

  return (
    <div className={className}>
      {/* Tab buttons */}
      <div
        ref={tablistRef}
        role="tablist"
        className="flex gap-4 border-b border-gray-200 dark:border-slate-800 mb-4"
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
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
        <div
          id={`panel-${activeTabContent.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTabContent.id}`}
          className="prose dark:prose-invert prose-code:break-words max-w-none"
        >
          {activeTabContent.content}
        </div>
      )}
    </div>
  );
}

export default Tabs;
