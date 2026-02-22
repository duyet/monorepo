"use client";

import { useState } from "react";
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

export function DashboardTabs({
  infrastructure,
  smartDevices,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("infrastructure");

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex gap-2" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
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
      <div role="tabpanel">
        {activeTab === "infrastructure" && infrastructure}
        {activeTab === "smart-devices" && smartDevices}
      </div>
    </div>
  );
}
