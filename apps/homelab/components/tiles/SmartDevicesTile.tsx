import { Smartphone } from "lucide-react";
import type { SmartDevice } from "@/lib/data/types";
import { StatusDot } from "./StatusDot";

function SmartDevicesTile({
  devices,
  onlineDevices,
}: {
  devices: SmartDevice[];
  onlineDevices: SmartDevice[];
}) {
  return (
    <div className="rd-card p-[clamp(18px,2.2vw,26px)] col-span-12">
      <div className="flex items-center justify-between mb-[14px]">
        <span className="rd-eyebrow">
          <Smartphone size={13} />
          Smart devices
        </span>
        <span className="rd-chip font-[var(--font-mono)] text-[11px]">
          {onlineDevices.length}/{devices.length} online
        </span>
      </div>
      <div className="rd-g2 gap-2">
        {devices.map((d) => (
          <div
            key={d.id}
            className="rd-card flex items-center justify-between gap-3 px-4 py-[14px]"
          >
            <div>
              <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[10.5px] uppercase tracking-[0.1em] mb-1">
                {d.type.replace(/-/g, " ")}
              </div>
              <div className="font-semibold text-sm tracking-[-0.01em]">{d.name}</div>
              <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px] mt-[2px]">{d.brand}</div>
            </div>
            <div className="rd-chip font-[var(--font-mono)] flex items-center gap-[7px]">
              <StatusDot status={d.status} />
              {d.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { SmartDevicesTile };
