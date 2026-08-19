"use client";

import { Badge } from "@duyet/components/ui/badge";
import { Button } from "@duyet/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useDowntimeHistory } from "@/hooks/useDashboard";
import { EXTERNAL_LINKS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ServiceDowntime() {
  const downtimeHistory = useDowntimeHistory();

  return (
    <Card className="min-w-0">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Downtime</CardTitle>
        <Button variant="ghost" size="xs" asChild className="text-muted-foreground">
          <a
            href={EXTERNAL_LINKS.UPTIME_MONITOR}
            target="_blank"
            rel="noopener noreferrer"
          >
            History
            <ExternalLink className="size-3" />
          </a>
        </Button>
      </CardHeader>
      <CardContent>
        {downtimeHistory.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            All systems operational
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {downtimeHistory.map((incident, index) => (
              <li key={index} className="flex min-w-0 items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs font-medium">{incident.service}</p>
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {incident.duration}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {incident.reason}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {incident.start} → {incident.end}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
