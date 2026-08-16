import { Area, Line } from "../dither-kit/area";
import { AreaChart, LineChart } from "../dither-kit/area-chart";
import type { ChartConfig } from "../dither-kit/chart-context";
import { Grid } from "../dither-kit/grid";
import { Legend } from "../dither-kit/legend";
import type { DitherColor } from "../dither-kit/palette";
import { Pie } from "../dither-kit/pie";
import { PieChart } from "../dither-kit/pie-chart";
import { Tooltip } from "../dither-kit/tooltip";
import { XAxis } from "../dither-kit/x-axis";
import { YAxis } from "../dither-kit/y-axis";
import type { DayCount, NamedCount } from "../../lib/system-queries";

const shortDay = (date: string) => date.slice(5); // YYYY-MM-DD -> MM-DD

function EmptyNote({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground">{label}</p>;
}

/** Dithered area chart of stories published per day. */
export function ItemsAreaChart({
  data,
  emptyLabel,
}: {
  data: DayCount[];
  emptyLabel: string;
}) {
  if (data.length === 0) return <EmptyNote label={emptyLabel} />;
  const rows = data.map((d) => ({ day: shortDay(d.date), items: d.count }));
  const config: ChartConfig = {
    items: { label: "Items", color: "green" },
  };
  return (
    <AreaChart data={rows} config={config} className="h-44 w-full">
      <Grid />
      <XAxis dataKey="day" />
      <YAxis />
      <Area dataKey="items" />
      <Tooltip />
    </AreaChart>
  );
}

/** Dithered line chart of LLM tokens spent per day. */
export function TokensLineChart({
  data,
  emptyLabel,
  formatValue,
}: {
  data: DayCount[];
  emptyLabel: string;
  formatValue?: (n: number) => string;
}) {
  if (data.length === 0) return <EmptyNote label={emptyLabel} />;
  const rows = data.map((d) => ({ day: shortDay(d.date), tokens: d.count }));
  const config: ChartConfig = {
    tokens: { label: "Tokens", color: "purple" },
  };
  return (
    <LineChart data={rows} config={config} className="h-44 w-full">
      <Grid />
      <XAxis dataKey="day" />
      <YAxis tickFormatter={formatValue} />
      <Line dataKey="tokens" />
      <Tooltip />
    </LineChart>
  );
}

const PIE_COLORS: DitherColor[] = [
  "blue",
  "green",
  "purple",
  "orange",
  "pink",
  "red",
];

/** Dithered donut of story share by category (top slices). */
export function CategoryDonut({
  data,
  emptyLabel,
}: {
  data: NamedCount[];
  emptyLabel: string;
}) {
  if (data.length === 0) return <EmptyNote label={emptyLabel} />;
  const top = data.slice(0, PIE_COLORS.length);
  const config: ChartConfig = Object.fromEntries(
    top.map((d, i) => [d.name, { label: d.name, color: PIE_COLORS[i] }])
  );
  return (
    <PieChart
      data={top}
      config={config}
      dataKey="count"
      nameKey="name"
      innerRadius={0.55}
      className="h-52 w-full"
    >
      <Pie />
      <Legend />
      <Tooltip />
    </PieChart>
  );
}
