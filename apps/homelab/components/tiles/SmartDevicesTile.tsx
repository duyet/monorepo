import { useSmartDevices } from "@/hooks/useDashboard";

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

  // Group devices by type for compact summary
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
    <div className="rd-card md:col-span-1 p-[clamp(14px,1.8vw,22px)]">
      <div className="flex items-center justify-between mb-3">
        <span className="rd-eyebrow">
          💡 Smart devices
        </span>
        <span className="rd-chip font-[var(--font-mono)] text-[11px]">
          {onlineCount}/{devices.length}
        </span>
      </div>

      <div className="space-y-2">
        {/* Dyson — key metrics */}
        <div className="flex items-center gap-2 py-1">
          <span className="rd-dot rd-ok rd-pulse" />
          <span className="font-[var(--font-mono)] text-[12px] font-medium text-[var(--rd-text)]">
            Dyson TP09
          </span>
          <span className="font-[var(--font-mono)] text-[11px] text-[var(--rd-text-3)] ml-auto">
            {dysonAirPurifier.airQuality} · {dysonAirPurifier.currentTemperature}° · {dysonAirPurifier.currentHumidity}%
          </span>
        </div>

        {/* Bosch — key metrics */}
        <div className="flex items-center gap-2 py-1">
          <span className="rd-dot rd-idle" />
          <span className="font-[var(--font-mono)] text-[12px] font-medium text-[var(--rd-text)]">
            Bosch Washer
          </span>
          <span className="font-[var(--font-mono)] text-[11px] text-[var(--rd-text-3)] ml-auto">
            {boschWashingMachine.status} · {boschWashingMachine.lifetimeCycles} cyc
          </span>
        </div>

        {/* LG Washer + Dryer */}
        <div className="flex items-center gap-2 py-1">
          <span className="rd-dot rd-idle" />
          <span className="font-[var(--font-mono)] text-[12px] font-medium text-[var(--rd-text)]">
            LG WashTower
          </span>
          <span className="font-[var(--font-mono)] text-[11px] text-[var(--rd-text-3)] ml-auto">
            washer + dryer
          </span>
        </div>

        {/* DQSmart Hub */}
        <div className="flex items-center gap-2 py-1">
          <span className="rd-dot rd-ok" />
          <span className="font-[var(--font-mono)] text-[12px] font-medium text-[var(--rd-text)]">
            DQSmart Hub
          </span>
          <span className="font-[var(--font-mono)] text-[11px] text-[var(--rd-text-3)] ml-auto">
            18 devices
          </span>
        </div>

        {/* Type summary row */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--rd-line)]">
          {Object.entries(byType).map(([type, counts]) => (
            <span key={type} className="rd-chip text-[10px] gap-1">
              {TYPE_ICONS[type] ?? "🔌"}
              {counts.online}/{counts.total}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}