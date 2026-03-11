import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingIndicator() {
  return (
    <div className="flex justify-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Avatar skeleton with "D" placeholder */}
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
        <span className="text-[10px] font-bold text-muted-foreground">D</span>
      </div>
      {/* Loading indicator with skeleton placeholder text */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}
