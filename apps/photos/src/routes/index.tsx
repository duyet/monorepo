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
      <div
        className="rd-mono rd-dim"
        style={{
          fontSize: 12.5,
          marginBottom: 20,
          display: "flex",
          gap: 18,
        }}
      >
        <span>
          <strong style={{ color: "var(--rd-text)" }}>{photos.length}</strong>{" "}
          photos
        </span>
        {photos.length > 0 && (
          <span>
            <MapPin size={12} style={{ display: "inline", verticalAlign: -1 }} />{" "}
            <strong style={{ color: "var(--rd-text)" }}>
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
    <div
      style={{
        display: "flex",
        minHeight: 400,
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
      }}
    >
      <div className="rd-card rd-card-pad" style={{ maxWidth: 420, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          {isRateLimit ? (
            <Timer size={36} style={{ color: "var(--rd-warn)" }} />
          ) : (
            <AlertTriangle size={36} style={{ color: "var(--rd-down)" }} />
          )}
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>
          {isRateLimit
            ? "API Rate Limit Reached"
            : isNetwork
              ? "Network Error"
              : isAuth
                ? "Service Configuration Error"
                : "Unable to Load Photos"}
        </h3>
        <p className="rd-muted" style={{ fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
          {error.message}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rd-btn rd-btn-ghost"
          style={{ marginTop: 20 }}
        >
          <RefreshCw size={14} /> Try Again
        </button>
      </div>
    </div>
  );
}
