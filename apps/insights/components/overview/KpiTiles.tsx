/**
 * The four headline KPI tiles, wrapped in the reveal-stagger grid.
 *
 * Kept as its own component for the stagger: `delay={i * 50}` is the only
 * piece of per-index state in the page, and it belongs with the grid that
 * applies it rather than inline in the route's JSX.
 */
import { Reveal } from "@duyet/components";
import { KpiTile } from "./KpiTile";
import type { KpiTileData } from "./KpiTile";

function KpiTiles({ kpis }: { kpis: KpiTileData[] }) {
  return (
    <div className="rd-g4 mt-[34px]">
      {kpis.map((t, i) => (
        <Reveal key={i} delay={i * 50}>
          <KpiTile t={t} />
        </Reveal>
      ))}
    </div>
  );
}

export { KpiTiles };
