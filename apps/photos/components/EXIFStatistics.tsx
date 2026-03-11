import { Camera, Image as ImageIcon } from "lucide-react";
import { aggregateEXIFStats } from "@/lib/exif-stats";
import type { Photo } from "@/lib/photo-provider";

interface EXIFStatisticsProps {
  photos: Photo[];
  className?: string;
}

export function EXIFStatisticsDisplay({ photos, className }: EXIFStatisticsProps) {
  const stats = aggregateEXIFStats(photos);

  if (stats.photosWithEXIF === 0) {
    return (
      <div className={`rounded-lg border bg-card p-6 text-center ${className || ""}`}>
        <ImageIcon className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground">No EXIF data available</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Camera information will appear here once photos with EXIF data are
          available
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ""}`}>
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Total Photos
          </p>
          <p className="mt-1 text-2xl font-semibold">{stats.totalPhotos}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            With EXIF
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {stats.photosWithEXIF}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Unique Cameras
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {stats.uniqueCameras}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Coverage
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {stats.photosWithEXIF > 0
              ? `${Math.round((stats.photosWithEXIF / stats.totalPhotos) * 100)}%`
              : "0%"}
          </p>
        </div>
      </div>

      {/* Top Cameras */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4">
          <h3 className="font-medium flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Top Cameras
          </h3>
          <p className="text-xs text-muted-foreground">
            Most used cameras across all photos
          </p>
        </div>

        <div className="space-y-3">
          {stats.topCameras.map((item, index) => (
            <div key={item.camera} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate flex-1" title={item.camera}>
                  <span className="text-muted-foreground mr-2">
                    #{index + 1}
                  </span>
                  {item.camera}
                </span>
                <span className="font-mono text-muted-foreground tabular-nums">
                  {item.count} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {stats.topCameras.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No camera data available
          </p>
        )}
      </div>
    </div>
  );
}
