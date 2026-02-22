"use client";

import { RefreshCw, Wifi } from "lucide-react";
import { useSmartDevices } from "@/hooks/useDashboard";
import { BoschWashingMachine } from "./BoschWashingMachine";

const deviceIcons: Record<string, React.ReactNode> = {
  "washing-machine": <RefreshCw className="h-5 w-5" />,
};

export function SmartDevicesOverview() {
  const { devices } = useSmartDevices();

  return (
    <div className="space-y-8">
      {/* Connected Devices Summary */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#a8d5ba] dark:bg-[#a8d5ba]/20">
          <Wifi className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {devices.length} Connected Device{devices.length !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {devices.filter((d) => d.status !== "offline").length} online
          </p>
        </div>
      </div>

      {/* Device Sections */}
      <BoschWashingMachine />

      {/* Placeholder for future devices */}
      <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          More devices coming soon (Dyson, etc.)
        </p>
      </div>
    </div>
  );
}
