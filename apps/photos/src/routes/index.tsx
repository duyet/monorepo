import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, MapPin, RefreshCw, Timer } from "lucide-react";
import { Eyebrow, Reveal } from "@duyet/components/redesign";
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
    <div
      style={{
        background: "var(--rd-bg)",
        color: "var(--rd-text)",
      }}
    >
      {/* hero header */}
      <div
        style={{
          paddingTop: "clamp(16px, 3vw, 40px)",
          paddingBottom: "clamp(20px, 3vw, 36px)",
        }}
      >
        <Reveal>
          <Eyebrow>Photos - photos.duyet.net</Eyebrow>
          <h1
            className="rd-display"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
              marginTop: 16,
            }}
          >
            Photography Collection
          </h1>
          <p className="rd-lead" style={{ marginTop: 18, maxWidth: "56ch" }}>
            A curated selection of {photos.length} photos from{" "}
            <a
              href="https://unsplash.com/@_duyet"
              target="_blank"
              rel="noopener noreferrer"
              className="rd-ulink"
            >
              Unsplash
            </a>{" "}
            and Cloudinary. Landscapes, architecture, and moments captured
            through the lens.
          </p>
          <div
            className="rd-mono rd-dim"
            style={{
              fontSize: 12.5,
              marginTop: 16,
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
        </Reveal>
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
        background: "var(--rd-bg)",
        color: "var(--rd-text)",
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
