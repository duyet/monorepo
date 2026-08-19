"use client";

import { Badge } from "@duyet/components/ui/badge";
import { Camera, Lightbulb, Router, WashingMachine } from "lucide-react";
import { useSmartDevices } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BoschWashingMachine } from "./BoschWashingMachine";
import { DysonAirPurifier } from "./DysonAirPurifier";

const STATUS_DOT: Record<string, string> = {
  online: "bg-[var(--rd-ok)]",
  idle: "bg-[var(--rd-warn)]",
  offline: "bg-destructive",
};

export function SmartDevicesOverview() {
  const { devices } = useSmartDevices();

  const onlineCount = devices.filter(
    (d) => d.status === "online" || d.status === "idle",
  ).length;

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

  const lights = grouped.light ?? [];
  const cameras = grouped.camera ?? [];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {devices.length} devices · {onlineCount} online
      </p>

      <DysonAirPurifier />
      <BoschWashingMachine />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="inline-flex items-center gap-2">
              <WashingMachine className="size-3.5" />
              LG WashTower
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              <li className="py-2 first:pt-0">
                <p className="text-sm font-medium">LG Washer</p>
                <p className="text-[11px] text-muted-foreground">
                  WV9-1408B3 · Laundry room · Idle · Last run 3h ago
                </p>
              </li>
              <li className="py-2 last:pb-0">
                <p className="text-sm font-medium">LG Dryer</p>
                <p className="text-[11px] text-muted-foreground">
                  WV9-1408B3 · Laundry room · Idle · Last run 2h ago
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="inline-flex items-center gap-2">
              <Router className="size-3.5" />
              DQSmart Hub
            </CardTitle>
            <Badge variant="secondary" className="font-mono text-[11px] font-normal">
              18 devices
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">
              DQS-H1 · Utility closet · Connected and operational
            </p>
          </CardContent>
        </Card>
      </div>

      {lights.length > 0 && (
        <Card className="min-w-0">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="inline-flex items-center gap-2">
              <Lightbulb className="size-3.5" />
              Lights
            </CardTitle>
            <Badge variant="secondary" className="font-mono text-[11px] font-normal">
              {lights.filter((d) => d.status === "online").length}/{lights.length} on
            </Badge>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
              {lights.map((light) => (
                <li key={light.id} className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[light.status]}`}
                    />
                    <span className="truncate font-mono text-xs">{light.location}</span>
                  </div>
                  <p className="pl-3 text-[10px] text-muted-foreground">{light.detail}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {cameras.length > 0 && (
        <Card className="min-w-0">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="inline-flex items-center gap-2">
              <Camera className="size-3.5" />
              Cameras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {cameras.map((cam) => (
                <li key={cam.id} className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-[var(--rd-ok)]" />
                    <span className="text-xs font-medium">{cam.name}</span>
                  </div>
                  <p className="pl-3 text-[11px] text-muted-foreground">
                    {cam.location} · {cam.detail}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
