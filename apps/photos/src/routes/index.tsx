import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, MapPin, RefreshCw, Timer } from "lucide-react";
import PhotoGallery from "@/components/PhotoGallery";
import { usePhotos } from "@/hooks/usePhotos";
import { LoadingGrid } from "@/components/LoadingStates";
import { AuthError, NetworkError, RateLimitError } from "@/lib/errors";

export const Route = createFileRoute("/")({
  component: PhotosPage,
});

function PhotosPage() {
  const { photos, error, isLoading } = usePhotos();

  if (isLoading) {
    return <LoadingGrid />;
  }

  if (error && photos.length === 0) {
    return <ErrorState error={error} />;
  }

  return (
    <div>
      {/* Stats strip */}
      <div className="rd-mono rd-dim text-[12.5px] mb-5 flex gap-[18px]">
        <span>
          <strong className="text-[var(--rd-text)]">{photos.length}</strong>{" "}
          photos
        </span>
        {photos.length > 0 && (
          <span>
            <MapPin size={12} style={{ display: "inline", verticalAlign: -1 }} />{" "}
            <strong className="text-[var(--rd-text)]">
              {new Set(
                photos
                  .map((p) => p.location?.country)
                  .filter(Boolean),
              ).size}
            </strong>{" "}
            locations
          </span>
        )}
      </div>

      {/* gallery */}
      <PhotoGallery photos={photos} />
    </div>
  );
}

function ErrorState({ error }: { error: Error }) {
  const isRateLimit = error instanceof RateLimitError;
  const isNetwork = error instanceof NetworkError;
  const isAuth = error instanceof AuthError;

  return (
    <div className="flex min-h-[400px] items-center justify-center p-10">
      <div className="rd-card rd-card-pad max-w-[420px] text-center">
        <div className="flex justify-center mb-4">
          {isRateLimit ? (
            <Timer size={36} style={{ color: "var(--rd-warn)" }} />
          ) : (
            <AlertTriangle size={36} style={{ color: "var(--rd-down)" }} />
          )}
        </div>
        <h3 className="text-lg font-semibold">
          {isRateLimit
            ? "API Rate Limit Reached"
            : isNetwork
              ? "Network Error"
              : isAuth
                ? "Service Configuration Error"
                : "Unable to Load Photos"}
        </h3>
        <p className="rd-muted text-sm mt-2 leading-[1.5]">
          {error.message}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rd-btn rd-btn-ghost mt-5"
        >
          <RefreshCw size={14} /> Try Again
        </button>
      </div>
    </div>
  );
}
