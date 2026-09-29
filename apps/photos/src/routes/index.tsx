import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw, Timer } from "lucide-react";
import { ogHeadLinks } from "@duyet/config/og";
import PhotoGallery from "@/components/PhotoGallery";
import { usePhotos } from "@/hooks/usePhotos";
import { LoadingGrid } from "@/components/LoadingStates";
import { AuthError, NetworkError, RateLimitError } from "@/lib/errors";

export const Route = createFileRoute("/")({
  // Title, description and the full OG/Twitter set come from the root route,
  // which already targets this URL. This route only contributes the canonical:
  // TanStack Start concatenates `links` across the matched route chain without
  // deduplicating, so a root-level canonical would emit a second one on /feed
  // and /:year.
  head: () => ({
    links: ogHeadLinks({ url: "https://photos.duyet.net" }),
  }),
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
      <div className="rd-card p-[clamp(18px,2.2vw,26px)] max-w-[420px] text-center">
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
        <p className="text-[var(--rd-text-2)] text-sm mt-2 leading-[1.5]">
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
