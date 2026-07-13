import { Sparkline as DitherSparkline } from "@/components/dither-kit";
import { Sparkline as SvgSparkline } from "@/components/charts/Sparkline";

interface KpiTileData {
  k: string;
  v: string;
  unit: string;
  sub: string;
  trend: string;
  spark: number[];
  /** true when a negative trend is desirable (e.g. spend going down) */
  good?: boolean;
}

function KpiTile({ t }: { t: KpiTileData }) {
  const up = t.trend.startsWith("+");
  const goodTrend = t.good ? !up : up;
  const sparkColor = t.good ? "green" : "blue";
  const hasSpark = t.spark.filter(Number.isFinite).length >= 2;
  return (
    <div className="rd-card p-[clamp(18px,2.2vw,26px)] flex flex-col gap-3 min-h-[168px]">
      <div className="flex justify-between items-center">
        <span className="rd-eyebrow text-[10.5px]">
          {t.k}
        </span>
        <span
          className={`font-[var(--font-mono)] text-[11.5px] ${goodTrend ? "text-[var(--rd-ok)]" : "text-[var(--rd-text-3)]"}`}
        >
          {t.trend}
        </span>
      </div>
      <div className="text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none">
        {t.v}
        <span className="rd-unit">{t.unit}</span>
      </div>
      {hasSpark ? (
        <div className="h-[34px] -mx-1">
          <DitherSparkline
            data={t.spark}
            color={sparkColor}
            bloom={goodTrend ? "low" : "off"}
            bloomOnHover
          />
        </div>
      ) : (
        <SvgSparkline data={t.spark} h={34} label={`${t.k} trend`} />
      )}
      <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11.5px]">
        {t.sub}
      </div>
    </div>
  );
}

export { KpiTile };
export type { KpiTileData };
