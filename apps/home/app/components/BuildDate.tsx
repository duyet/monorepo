"use client";

import { useEffect, useState } from "react";

export function BuildDate() {
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  return (
    <div className="inline-flex rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-mono text-neutral-500 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
      {date ? `Updated ${date}` : "Updated …"}
    </div>
  );
}
