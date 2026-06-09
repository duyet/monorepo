"use client";

import { Camera, Lightbulb, Router, Smartphone, WashingMachine } from "lucide-react";
import { useSmartDevices } from "@/hooks/useDashboard";
import { BoschWashingMachine } from "./BoschWashingMachine";
import { DysonAirPurifier } from "./DysonAirPurifier";

const STATUS_DOT: Record<string, string> = {
  online: "rd-dot rd-ok",
  idle: "rd-dot rd-idle",
  offline: "rd-dot rd-down",
};

export function SmartDevicesOverview() {
  const { devices } = useSmartDevices();

  const onlineCount = devices.filter(
    (d) => d.status === "online" || d.status === "idle",
  ).length;

  // Group non-detail devices by type
  const detailIds = new Set(["bosch-washer", "dyson-purifier"]);
  const otherDevices = devices.filter((d) => !detailIds.has(d.id));

  const grouped = otherDevices.reduce(
    (acc, d) => {
      if (!acc[d.type]) acc[d.type] = [];
      acc[d.type].push(d);
      return acc;
    },
    {} as Record<string, typeof otherDevices>,
  );

  return (
    <div className="space-y-8">
      {/* Connected Devices Summary */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--rd-accent-bg)]">
          <Smartphone className="h-4 w-4 text-[var(--rd-accent)]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--rd-text)]">
            {devices.length} devices · {onlineCount} online
          </p>
          <p className="text-xs text-[var(--rd-text-3)]">
            {Object.keys(grouped).length + 2} device types
          </p>
        </div>
      </div>

      {/* Dyson Air Purifier */}
      <DysonAirPurifier />

      <div className="border-t border-[var(--rd-border)]" />

      {/* Bosch Washing Machine */}
      <BoschWashingMachine />

      <div className="border-t border-[var(--rd-border)]" />

      {/* LG Washer + Dryer */}
      <div>
        <h3 className="text-base font-semibold text-[var(--rd-text)] mb-4 flex items-center gap-2">
          <WashingMachine className="h-4 w-4 text-[var(--rd-accent)]" />
          LG WashTower
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rd-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="rd-dot rd-idle" />
              <span className="font-medium text-sm text-[var(--rd-text)]">LG Washer</span>
            </div>
            <p className="text-xs text-[var(--rd-text-3)]">WV9-1408B3 · Laundry room</p>
            <p className="text-xs text-[var(--rd-text-3)] mt-1">Status: Idle · Last run: 3h ago</p>
          </div>
          <div className="rd-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="rd-dot rd-idle" />
              <span className="font-medium text-sm text-[var(--rd-text)]">LG Dryer</span>
            </div>
            <p className="text-xs text-[var(--rd-text-3)]">WV9-1408B3 · Laundry room</p>
            <p className="text-xs text-[var(--rd-text-3)] mt-1">Status: Idle · Last run: 2h ago</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--rd-border)]" />

      {/* DQSmart Hub */}
      <div>
        <h3 className="text-base font-semibold text-[var(--rd-text)] mb-4 flex items-center gap-2">
          <Router className="h-4 w-4 text-[var(--rd-accent)]" />
          DQSmart Hub
        </h3>
        <div className="rd-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="rd-dot rd-ok rd-pulse" />
            <span className="font-medium text-sm text-[var(--rd-text)]">DQSmart Hub</span>
            <span className="rd-chip text-[10px] ml-auto">18 devices</span>
          </div>
          <p className="text-xs text-[var(--rd-text-3)]">DQS-H1 · Utility closet · Connected and operational</p>
        </div>
      </div>

      <div className="border-t border-[var(--rd-border)]" />

      {/* Lights */}
      {grouped.light && (
        <div>
          <h3 className="text-base font-semibold text-[var(--rd-text)] mb-4 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[var(--rd-accent)]" />
            Smart Lights
            <span className="rd-chip text-[10px]">
              {grouped.light.filter((d) => d.status === "online").length}/{grouped.light.length} on
            </span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {grouped.light.map((light) => (
              <div key={light.id} className="rd-card p-3">
                <div className="flex items-center gap-2">
                  <span className={STATUS_DOT[light.status]} />
                  <span className="font-[var(--font-mono)] text-[12px] font-medium text-[var(--rd-text)] truncate">
                    {light.location}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--rd-text-3)] mt-1">{light.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cameras */}
      {grouped.camera && (
        <div>
          <h3 className="text-base font-semibold text-[var(--rd-text)] mb-4 flex items-center gap-2">
            <Camera className="h-4 w-4 text-[var(--rd-accent)]" />
            Cameras
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {grouped.camera.map((cam) => (
              <div key={cam.id} className="rd-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rd-dot rd-ok" />
                  <span className="font-medium text-sm text-[var(--rd-text)]">{cam.name}</span>
                </div>
                <p className="text-xs text-[var(--rd-text-3)]">{cam.location}</p>
                <p className="text-xs text-[var(--rd-text-3)] mt-1">{cam.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
