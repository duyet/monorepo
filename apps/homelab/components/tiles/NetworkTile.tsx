import { Sparkline } from "@duyet/components";
import { Separator } from "@duyet/components/ui/separator";
import { useNetworkStats } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NetworkTile() {
  const { speedTest, networkTraffic } = useNetworkStats();
  const trafficInData = networkTraffic.map((d) => d.in);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Network</CardTitle>
      </CardHeader>
      <CardContent>
        <Metric label="Download" value={speedTest.download} unit="Mbps" />
        <Separator />
        <Metric label="Upload" value={speedTest.upload} unit="Mbps" />
        <Separator />
        <Metric label="Ping" value={speedTest.ping} unit="ms" />
        <div className="mt-3">
          <Sparkline data={trafficInData} h={28} stroke="var(--rd-accent)" />
        </div>
        <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
          {speedTest.timestamp}
        </p>
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 first:pt-0">
      <span className="text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-lg font-semibold tabular-nums tracking-tight">
        {value}
        <span className="ml-0.5 text-[11px] font-normal text-muted-foreground">
          {unit}
        </span>
      </span>
    </div>
  );
}
