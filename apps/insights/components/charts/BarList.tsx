"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@duyet/libs";
import Link from "next/link";

interface BarListItem {
  name: string;
  value: number;
  href?: string;
}

interface BarListProps {
  data: BarListItem[];
  className?: string;
}

export function BarList({ data, className }: BarListProps) {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className={cn("space-y-2", className)}>
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;

        const ItemContent = () => (
          <>
            <div className="mb-1 flex items-center justify-between">
              <span className="truncate text-sm font-medium">{item.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {item.value.toLocaleString()}
              </span>
            </div>
            <Progress value={percentage} className="h-1.5" />
          </>
        );

        return (
          <div key={index}>
            {item.href ? (
              <Link
                href={item.href}
                className="hover:bg-muted/50 block rounded-md p-2 transition-colors"
              >
                <ItemContent />
              </Link>
            ) : (
              <div className="p-2">
                <ItemContent />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
