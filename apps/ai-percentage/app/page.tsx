"use client";

import { AIPercentageHero } from "@/components/AIPercentageHero";
import { AIPercentageTrend } from "@/components/AIPercentageTrend";

export default function Page() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="border-b pb-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">AI Code Usage</h1>
        <p className="mt-1 text-muted-foreground">
          Percentage of code written by AI across all repositories
        </p>
      </div>

      <div className="mt-8 space-y-12">
        <AIPercentageHero />
        <AIPercentageTrend days={365} />
      </div>

      <p className="mt-12 text-xs text-muted-foreground text-center">
        Data Source: GitHub + ClickHouse | Last updated:{" "}
        {new Date().toLocaleDateString()}
      </p>
    </main>
  );
}
