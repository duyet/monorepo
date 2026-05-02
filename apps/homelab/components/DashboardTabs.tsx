import { useNavigate, useSearch } from "@tanstack/react-router";
import { Server, Smartphone } from "lucide-react";
import { useCallback, useRef } from "react";
import type { RootSearch } from "@/src/routes/__root";

const tabs = [
  { id: "infrastructure", label: "Infrastructure", icon: Server },
  { id: "smart-devices", label: "Smart Devices", icon: Smartphone },
] as const;

type TabId = (typeof tabs)[number]["id"];

interface DashboardTabsProps {
  infrastructure: React.ReactNode;
  smartDevices: React.ReactNode;
}

export function DashboardTabs({
  infrastructure,
  smartDevices,
}: DashboardTabsProps) {
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ strict: false }) as RootSearch;
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const rawTab = search.tab ?? "";
  const activeTab: TabId = tabs.some((t) => t.id === rawTab)
    ? (rawTab as TabId)
    : "infrastructure";

  const handleTabChange = useCallback(
    (id: TabId) => {
      navigate({
        to: "/",
        search: (prev: RootSearch) => ({ ...prev, tab: id }),
        replace: true,
      });
    },
    [navigate]
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
    [activeTab, handleTabChange]
  );

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        onKeyDown={handleKeyDown}
      >
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
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-neutral-950 text-white dark:bg-neutral-950 dark:text-white"
                  : "bg-white text-neutral-600 ring-1 ring-[#e8e0d4] hover:bg-[#fffdf7] dark:bg-[#1a1a1a] dark:text-muted-foreground dark:ring-white/12 dark:hover:bg-[#242420]"
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
