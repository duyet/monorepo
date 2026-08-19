import { Badge } from "@duyet/components/ui/badge";
import { Separator } from "@duyet/components/ui/separator";
import { useSmartDevices } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TYPE_ICONS: Record<string, string> = {
  "washing-machine": "🫧",
  dryer: "🌀",
  "air-purifier": "💨",
  light: "💡",
  camera: "📷",
  hub: "📡",
  other: "🔌",
};

export function SmartDevicesTile() {
  const { devices, boschWashingMachine, dysonAirPurifier } = useSmartDevices();

  const onlineCount = devices.filter(
    (d) => d.status === "online" || d.status === "idle",
  ).length;

  const byType = devices.reduce(
    (acc, d) => {
      if (!acc[d.type]) acc[d.type] = { total: 0, online: 0 };
      acc[d.type].total++;
      if (d.status === "online" || d.status === "idle") acc[d.type].online++;
      return acc;
    },
    {} as Record<string, { total: number; online: number }>,
  );

  return (
    <Card className="min-w-0">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Smart devices</CardTitle>
        <Badge variant="secondary" className="font-mono text-[11px] font-normal">
          {onlineCount}/{devices.length}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-0">
        <DeviceRow
          name="Dyson TP09"
          detail={`${dysonAirPurifier.airQuality} · ${dysonAirPurifier.currentTemperature}° · ${dysonAirPurifier.currentHumidity}%`}
          ok
        />
        <Separator />
        <DeviceRow
          name="Bosch Washer"
          detail={`${boschWashingMachine.status} · ${boschWashingMachine.lifetimeCycles} cyc`}
        />
        <Separator />
        <DeviceRow name="LG WashTower" detail="washer + dryer" />
        <Separator />
        <DeviceRow name="DQSmart Hub" detail="18 devices" ok />
        <div className="flex flex-wrap gap-1.5 pt-3">
          {Object.entries(byType).map(([type, counts]) => (
            <Badge
              key={type}
              variant="outline"
              className="gap-1 text-[10px] font-normal"
            >
              {TYPE_ICONS[type] ?? "🔌"}
              {counts.online}/{counts.total}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DeviceRow({
  name,
  detail,
  ok,
}: {
  name: string;
  detail: string;
  ok?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-2 first:pt-0">
      <span
        className={`size-1.5 shrink-0 rounded-full ${
          ok ? "bg-[var(--rd-ok)]" : "bg-[var(--rd-warn)]"
        }`}
      />
      <span className="font-mono text-xs font-medium">{name}</span>
      <span className="ml-auto truncate font-mono text-[11px] text-muted-foreground">
        {detail}
      </span>
    </div>
  );
}
