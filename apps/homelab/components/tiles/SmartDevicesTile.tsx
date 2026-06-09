import { Smartphone } from "lucide-react";
import { useSmartDevices } from "@/hooks/useDashboard";

export function SmartDevicesTile() {
  const { devices, boschWashingMachine, dysonAirPurifier } = useSmartDevices();

  const onlineCount = devices.filter(
    (d) => d.status === "online" || d.status === "idle",
  ).length;

  return (
    <div className="rd-card md:col-span-1 p-[clamp(14px,1.8vw,22px)]">
      <div className="flex items-center justify-between mb-3">
        <span className="rd-eyebrow">
          <Smartphone size={13} />
          Smart devices
        </span>
        <span className="rd-chip font-[var(--font-mono)] text-[11px]">
          {onlineCount}/{devices.length} online
        </span>
      </div>

      <div className="rd-rows">
        {/* Dyson Air Purifier */}
        <div className="rd-row grid-cols-[auto_1fr] gap-3">
          <span
            className={`rd-dot ${
              dysonAirPurifier.status === "online" ? "rd-ok" : "rd-down"
            }`}
          />
          <div className="min-w-0">
            <div className="font-[var(--font-mono)] text-[13px] font-medium text-[var(--rd-text)] truncate">
              Dyson TP09
            </div>
            <div className="font-[var(--font-mono)] text-[11px] text-[var(--rd-text-3)] mt-0.5">
              {dysonAirPurifier.airQuality} ·{" "}
              {dysonAirPurifier.currentTemperature}°C ·{" "}
              {dysonAirPurifier.currentHumidity}%
            </div>
          </div>
        </div>

        {/* Bosch Washer */}
        <div className="rd-row grid-cols-[auto_1fr] gap-3">
          <span
            className={`rd-dot ${
              boschWashingMachine.status === "online"
                ? "rd-ok"
                : boschWashingMachine.status === "idle"
                  ? "rd-idle"
                  : "rd-down"
            }`}
          />
          <div className="min-w-0">
            <div className="font-[var(--font-mono)] text-[13px] font-medium text-[var(--rd-text)] truncate">
              Bosch Series 6
            </div>
            <div className="font-[var(--font-mono)] text-[11px] text-[var(--rd-text-3)] mt-0.5">
              {boschWashingMachine.status} ·{" "}
              {boschWashingMachine.lifetimeCycles} cycles
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
