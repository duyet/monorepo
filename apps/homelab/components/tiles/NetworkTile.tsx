import { ArrowDown, ArrowUp, Gauge, Network } from "lucide-react";
import type { NetworkSpeedTest } from "@/lib/data/types";

function NetworkTile({ speedTest }: { speedTest: NetworkSpeedTest }) {
  return (
    <div className="rd-card p-[clamp(18px,2.2vw,26px)] col-span-12">
      <div className="flex items-center justify-between mb-[14px]">
        <span className="rd-eyebrow">
          <Network size={13} />
          Network
        </span>
        <Gauge size={14} style={{ color: "var(--rd-text-3)" }} />
      </div>
      <div className="flex flex-wrap gap-8">
        <div>
          <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11.5px] flex items-center gap-1 mb-[6px]">
            <ArrowDown size={12} /> Down
          </div>
          <div className="text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none text-[1.65rem]">
            {speedTest.download}
            <span className="rd-unit">Mbps</span>
          </div>
        </div>
        <div>
          <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11.5px] flex items-center gap-1 mb-[6px]">
            <ArrowUp size={12} /> Up
          </div>
          <div className="text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none text-[1.65rem]">
            {speedTest.upload}
            <span className="rd-unit">Mbps</span>
          </div>
        </div>
        <div>
          <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11.5px] flex items-center gap-1 mb-[6px]">
            <Gauge size={12} /> Ping
          </div>
          <div className="text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none text-[1.65rem]">
            {speedTest.ping}
            <span className="rd-unit">ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { NetworkTile };
