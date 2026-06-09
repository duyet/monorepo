import { Network } from "lucide-react";
import { Sparkline } from "@duyet/components";
import { useNetworkStats } from "@/hooks/useDashboard";

export function NetworkTile() {
  const { speedTest, networkTraffic } = useNetworkStats();

  const trafficInData = networkTraffic.map((d) => d.in);

  return (
    <div className="rd-card md:col-span-1 p-[clamp(14px,1.8vw,22px)]">
      <div className="flex items-center justify-between mb-3">
        <span className="rd-eyebrow">
          <Network size={13} />
          Network
        </span>
      </div>

      {/* Download */}
      <div className="flex items-center justify-between py-2 border-b border-[var(--rd-line)]">
        <span className="text-[11px] text-[var(--rd-text-3)] font-medium">
          Download
        </span>
        <span className="font-[var(--font-mono)] text-lg font-semibold tracking-[-0.02em] text-[var(--rd-text)]">
          {speedTest.download}
          <span className="rd-unit">Mbps</span>
        </span>
      </div>

      {/* Upload */}
      <div className="flex items-center justify-between py-2 border-b border-[var(--rd-line)]">
        <span className="text-[11px] text-[var(--rd-text-3)] font-medium">
          Upload
        </span>
        <span className="font-[var(--font-mono)] text-lg font-semibold tracking-[-0.02em] text-[var(--rd-text)]">
          {speedTest.upload}
          <span className="rd-unit">Mbps</span>
        </span>
      </div>

      {/* Ping */}
      <div className="flex items-center justify-between py-2 border-b border-[var(--rd-line)]">
        <span className="text-[11px] text-[var(--rd-text-3)] font-medium">
          Ping
        </span>
        <span className="font-[var(--font-mono)] text-lg font-semibold tracking-[-0.02em] text-[var(--rd-text)]">
          {speedTest.ping}
          <span className="rd-unit">ms</span>
        </span>
      </div>

      {/* Traffic sparkline */}
      <div className="mt-3">
        <Sparkline
          data={trafficInData}
          h={28}
          stroke="var(--rd-accent)"
        />
      </div>

      <div className="text-[10px] text-[var(--rd-text-4)] font-[var(--font-mono)] mt-1.5">
        {speedTest.timestamp}
      </div>
    </div>
  );
}
