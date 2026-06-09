import { Box, Server, Smartphone } from "lucide-react";
import { useCallback, useRef, useState } from "react";

const tabs = [
  { id: "infrastructure", label: "Infrastructure", icon: Server },
  { id: "k8s", label: "Kubernetes", icon: Box },
  { id: "smart-devices", label: "Smart Devices", icon: Smartphone },
] as const;

type TabId = (typeof tabs)[number]["id"];

interface DashboardTabsProps {
  infrastructure: React.ReactNode;
  k8s: React.ReactNode;
  smartDevices: React.ReactNode;
}

export function DashboardTabs({
  infrastructure,
  k8s,
  smartDevices,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("infrastructure");
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

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
        setActiveTab(nextTab.id);
        tabRefs.current.get(nextTab.id)?.focus();
      }
    },
    [activeTab]
  );

  return (
    <div className="space-y-6">
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
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-[var(--rd-r-sm)] px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--rd-text)] text-[var(--rd-bg)]"
                  : "bg-[var(--rd-surface)] text-[var(--rd-text-2)] ring-1 ring-[var(--rd-border)] hover:bg-[var(--rd-surface-2)]"
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
        {activeTab === "k8s" && k8s}
        {activeTab === "smart-devices" && smartDevices}
      </div>
    </div>
  );
}
