import { cn } from "@duyet/libs/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef, useState } from "react";
import {
  getOptimalImageSrc,
} from "@/lib/ImageOptimization";
import {
  formatPhotoDescription,
  formatPhotoMetadata,
} from "@/lib/MetadataFormatters";
import type { Photo } from "@/lib/photo-provider";
import { useLightboxNavigation } from "../hooks/UseKeyboardNavigation";
import {
  InfoPanel,
  LightboxTopControls,
  NavigationButton,
  type PlaybackSpeed,
  SlideshowControls,
  SlideshowProgressBar,
} from "./LightboxControls";

interface LightboxProps {
  photo: Photo;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex: number;
  totalCount: number;
}

export default function Lightbox({
  photo,
  isOpen,
  onNext,
  onPrevious,
  currentIndex,
  totalCount,
  onClose,
}: LightboxProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Slideshow state
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(3);
  const [slideshowProgress, setSlideshowProgress] = useState(0);
  const slideshowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPhotoIdRef = useRef<string | null>(null);

  // Keep a current ref to onNext so the interval always calls the latest callback
  const onNextRef = useRef(onNext);
  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  // Get formatted metadata and description
  const metadata = formatPhotoMetadata(photo);
  const description = formatPhotoDescription(photo);

  // Download handler - fetches image and triggers browser download
  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    let objectUrl: string | null = null;

    try {
      // Use raw if available (highest quality), otherwise fall back to full
      const imageUrl = photo.urls.raw || photo.urls.full;

      // Fetch the image as blob to handle cross-origin downloads
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();
      objectUrl = window.URL.createObjectURL(blob);

      // Create temporary anchor element to trigger download
      const a = document.createElement("a");
      a.href = objectUrl;
      // Generate filename from photo id and description
      const safeDescription = photo.description
        ? photo.description.slice(0, 30).replace(/[^a-z0-9]/gi, "-")
        : "photo";
      a.download = `${photo.id}-${safeDescription}.jpg`;
      document.body.appendChild(a);
      a.click();

      // Cleanup anchor
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab
      const fallbackUrl = photo.urls.raw || photo.urls.full;
      window.open(fallbackUrl, "_blank");
    } finally {
      // Delay revocation to give the browser time to initiate the download
      if (objectUrl) {
        setTimeout(() => URL.revokeObjectURL(objectUrl!), 1000);
      }
      setIsDownloading(false);
    }
  };

  // Cleanup slideshow timers
  const cleanupSlideshow = () => {
    if (slideshowTimerRef.current) {
      clearTimeout(slideshowTimerRef.current);
      slideshowTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setSlideshowProgress(0);
  };

  // Start slideshow
  const startSlideshow = () => {
    cleanupSlideshow();
    setIsSlideshowPlaying(true);

    // Update progress every 50ms for smooth animation
    const progressUpdateInterval = 50;
    const totalProgressSteps = (playbackSpeed * 1000) / progressUpdateInterval;
    let currentStep = 0;

    progressIntervalRef.current = setInterval(() => {
      currentStep++;
      setSlideshowProgress(currentStep / totalProgressSteps);

      if (currentStep >= totalProgressSteps) {
        // Time to advance to next photo — read ref so we always have the current callback
        if (onNextRef.current) {
          onNextRef.current();
          // Reset progress for next photo
          currentStep = 0;
          setSlideshowProgress(0);
        } else {
          // End of slideshow - stop at last photo
          stopSlideshow();
        }
      }
    }, progressUpdateInterval);
  };

  // Stop slideshow
  const stopSlideshow = () => {
    cleanupSlideshow();
    setIsSlideshowPlaying(false);
  };

  // Toggle slideshow play/pause
  const handleToggleSlideshow = () => {
    if (isSlideshowPlaying) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  };

  // Handle playback speed change
  const handleSpeedChange = (speed: PlaybackSpeed) => {
    setPlaybackSpeed(speed);
    // Restart slideshow if playing with new speed
    if (isSlideshowPlaying) {
      startSlideshow();
    }
  };

  // Setup navigation hooks
  const touchHandlers = useLightboxNavigation({
    isOpen,
    canGoNext: !!onNext,
    canGoPrevious: !!onPrevious,
    onClose,
    onNext,
    onPrevious,
    onToggleFullscreen: () => setIsFullscreen(!isFullscreen),
    onToggleInfo: () => setShowInfo(!showInfo),
    onDownload: handleDownload,
    onToggleSlideshow: handleToggleSlideshow,
  });

  // Reset states when photo changes or lightbox opens
  useEffect(() => {
    setIsLoading(true);
  }, [photo.id]);

  // Handle photo change during slideshow
  useEffect(() => {
    // Only restart if slideshow is playing and photo actually changed
    if (isSlideshowPlaying && lastPhotoIdRef.current !== photo.id) {
      // Photo changed during slideshow - the progress interval will handle advancing
      lastPhotoIdRef.current = photo.id;
    } else if (!lastPhotoIdRef.current) {
      // Initialize on first photo
      lastPhotoIdRef.current = photo.id;
    }
  }, [photo.id, isSlideshowPlaying]);

  // Cleanup slideshow when lightbox closes
  useEffect(() => {
    if (isOpen) {
      setIsFullscreen(true);
      setShowInfo(false);
    } else {
      // Stop slideshow when lightbox closes
      cleanupSlideshow();
      setIsSlideshowPlaying(false);
    }
  }, [isOpen]);

  // Cleanup slideshow on unmount
  useEffect(() => {
    return () => {
      cleanupSlideshow();
    };
  }, []);

  // Stop slideshow if user manually navigates to last photo
  useEffect(() => {
    if (isSlideshowPlaying && currentIndex >= totalCount - 1) {
      stopSlideshow();
    }
  }, [currentIndex, totalCount, isSlideshowPlaying]);

  const thumbnailSrc = photo.urls.regular;
  const hiresSrc = getOptimalImageSrc(photo, { context: "lightbox" });

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed inset-0 z-50",
            isFullscreen
              ? "overflow-hidden p-0"
              : "flex items-center justify-center p-4"
          )}
        >
          {/* Accessibility title */}
          <Dialog.Title className="sr-only">{description}</Dialog.Title>

          <div
            className={cn(
              "relative w-full",
              isFullscreen ? "h-full max-w-none" : "h-full max-w-7xl"
            )}
          >
            {/* Top Controls */}
            <LightboxTopControls
              currentIndex={currentIndex}
              totalCount={totalCount}
              isFullscreen={isFullscreen}
              showInfo={showInfo}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
              onToggleInfo={() => setShowInfo(!showInfo)}
              onDownload={handleDownload}
            />

            {/* Navigation Buttons */}
            {onPrevious && (
              <NavigationButton
                direction="previous"
                onClick={onPrevious}
                isFullscreen={isFullscreen}
              />
            )}

            {onNext && (
              <NavigationButton
                direction="next"
                onClick={onNext}
                isFullscreen={isFullscreen}
              />
            )}

            {/* Main Image Container */}
            <div
              className={cn(
                "relative",
                isFullscreen
                  ? "flex h-full w-full items-center justify-center"
                  : "flex h-full flex-col"
              )}
              {...touchHandlers}
            >
              {isFullscreen ? (
                // Fullscreen Image
                <div
                  className="relative h-full w-full cursor-pointer"
                  onClick={() => setIsFullscreen(false)}
                  title="Click to exit fullscreen"
                >
                  {/* Thumbnail/preview image - loads immediately */}
                  <img
                    src={thumbnailSrc}
                    alt={description}
                    className="absolute inset-0 h-full w-full object-contain"
                    loading="eager"
                  />

                  {/* High-resolution image - loads progressively */}
                  <img
                    src={hiresSrc}
                    alt={description}
                    className={cn(
                      "absolute inset-0 h-full w-full object-contain transition-opacity duration-700",
                      isLoading ? "opacity-0" : "opacity-100"
                    )}
                    onLoad={() => setIsLoading(false)}
                    loading="eager"
                  />
                </div>
              ) : (
                // Contained Layout
                <>
                  <div className="relative flex-1">
                    <div
                      className="relative h-full w-full cursor-pointer"
                      onClick={() => setIsFullscreen(true)}
                      title="Click to enter fullscreen"
                    >
                      {/* Thumbnail/preview image - loads immediately */}
                      <img
                        src={thumbnailSrc}
                        alt={description}
                        className="absolute inset-0 h-full w-full object-contain"
                        loading="eager"
                      />

                      {/* High-resolution image - loads progressively */}
                      <img
                        src={hiresSrc}
                        alt={description}
                        className={cn(
                          "absolute inset-0 h-full w-full object-contain transition-opacity duration-700",
                          isLoading ? "opacity-0" : "opacity-100"
                        )}
                        onLoad={() => setIsLoading(false)}
                        loading="eager"
                      />
                    </div>
                  </div>

                  {/* Info Panel for contained mode */}
                  <InfoPanel
                    photo={photo}
                    metadata={metadata}
                    isFullscreen={false}
                  />
                </>
              )}

              {/* Loading Spinner Overlay - only shows spinner, no black box */}
              {isLoading && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-black/60 p-4 backdrop-blur-sm">
                    <div
                      className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"
                      aria-label="Loading high-resolution image..."
                      role="status"
                    />
                  </div>
                </div>
              )}

              {/* Info Panel for fullscreen mode */}
              {isFullscreen && showInfo && (
                <InfoPanel
                  photo={photo}
                  metadata={metadata}
                  isFullscreen={true}
                />
              )}

              {/* Slideshow Controls */}
              {isFullscreen && onNext && (
                <SlideshowControls
                  isPlaying={isSlideshowPlaying}
                  playbackSpeed={playbackSpeed}
                  onTogglePlay={handleToggleSlideshow}
                  onSpeedChange={handleSpeedChange}
                />
              )}

              {/* Slideshow Progress Bar */}
              <SlideshowProgressBar
                isPlaying={isSlideshowPlaying}
                progress={slideshowProgress}
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
