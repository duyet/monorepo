"use client";

import { useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Server, Smartphone } from "lucide-react";

const tabs = [
  { id: "infrastructure", label: "Infrastructure", icon: Server },
  { id: "smart-devices", label: "Smart Devices", icon: Smartphone },
] as const;

type TabId = (typeof tabs)[number]["id"];

interface DashboardTabsProps {
  infrastructure: React.ReactNode;
  smartDevices: React.ReactNode;
}

function DashboardTabsInner({ infrastructure, smartDevices }: DashboardTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const rawTab = searchParams.get("tab");
  const activeTab: TabId = tabs.some((t) => t.id === rawTab)
    ? (rawTab as TabId)
    : "infrastructure";

  const handleTabChange = useCallback(
    (id: TabId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", id);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = tabs.findIndex((t) => t.id === activeTab);
      let nextIndex: number | null = null;

      if (e.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        nextIndex = 0;
      } else if (e.key === "End") {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        const nextTab = tabs[nextIndex];
        handleTabChange(nextTab.id);
        tabRefs.current.get(nextTab.id)?.focus();
      }
    },
    [activeTab, handleTabChange],
  );

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex gap-2" role="tablist" onKeyDown={handleKeyDown}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
              }}
              id={`${tab.id}-tab`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleTabChange(tab.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div
        id={`${activeTab}-panel`}
        role="tabpanel"
        aria-labelledby={`${activeTab}-tab`}
      >
        {activeTab === "infrastructure" && infrastructure}
        {activeTab === "smart-devices" && smartDevices}
      </div>
    </div>
  );
}

export function DashboardTabs(props: DashboardTabsProps) {
  return (
    <Suspense
      fallback={
        <div className="h-10 w-64 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
      }
    >
      <DashboardTabsInner {...props} />
    </Suspense>
  );
}
