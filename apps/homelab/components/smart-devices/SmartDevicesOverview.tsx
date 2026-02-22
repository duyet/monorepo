"use client";

import { Wifi } from "lucide-react";
import { useSmartDevices } from "@/hooks/useDashboard";
import { BoschWashingMachine } from "./BoschWashingMachine";
import { DysonAirPurifier } from "./DysonAirPurifier";

export function SmartDevicesOverview() {
  const { devices } = useSmartDevices();

  return (
    <div className="space-y-8">
      {/* Connected Devices Summary */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
          <Wifi className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
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

      {/* Dyson Air Purifier */}
      <DysonAirPurifier />

      {/* Separator */}
      <div className="border-t border-neutral-200 dark:border-neutral-800" />

      {/* Bosch Washing Machine */}
      <BoschWashingMachine />
    </div>
  );
}
