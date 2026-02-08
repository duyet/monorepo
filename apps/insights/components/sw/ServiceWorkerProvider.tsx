/**
 * Service Worker Registration Component
 * Registers and manages the service worker for offline support
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Wifi, WifiOff, RefreshCw, X } from "lucide-react";

interface ServiceWorkerContextValue {
  isOnline: boolean;
  updateAvailable: boolean;
  refresh: () => void;
}

export function ServiceWorkerProvider() {
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingServiceWorker, setWaitingServiceWorker] = useState<
    ServiceWorker | null
  >(null);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator && typeof window !== "undefined") {
      // Only register in production
      if (
        process.env.NODE_ENV === "production" ||
        location.hostname === "localhost"
      ) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[SW] Service worker registered:", registration);

            // Check for updates
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;

              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    // New version available
                    setUpdateAvailable(true);
                    setWaitingServiceWorker(newWorker);
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error("[SW] Service worker registration failed:", error);
          });

        // Handle service worker messages
        navigator.serviceWorker.addEventListener("message", (event) => {
          const { type, data } = event.data;

          switch (type) {
            case "SYNC_COMPLETE":
              console.log("[SW] Background sync complete:", data);
              break;
            case "CACHE_STATUS":
              console.log("[SW] Cache status:", data);
              break;
            default:
              break;
          }
        });
      }
    }
  }, []);

  const handleUpdate = useCallback(() => {
    if (waitingServiceWorker) {
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
      setUpdateAvailable(false);
      window.location.reload();
    }
  }, [waitingServiceWorker]);

  const handleDismiss = useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  return (
    <>
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-orange-800 shadow-lg dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200">
          <WifiOff className="h-4 w-4" />
          <span>You are offline. Some features may be limited.</span>
        </div>
      )}

      {/* Update Available Banner */}
      {updateAvailable && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-lg dark:border-blue-800 dark:bg-blue-950">
          <div className="flex items-start gap-3">
            <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Update Available
              </p>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                A new version of the dashboard is available. Would you like to
                update?
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleUpdate}
              className="inline-flex items-center gap-2 rounded-md border border-blue-300 bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-200 dark:border-blue-700 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700"
            >
              <RefreshCw className="h-3 w-3" />
              Update Now
            </button>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Later
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Hook to access service worker status
 */
export function useServiceWorker(): ServiceWorkerContextValue {
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const refresh = useCallback(() => {
    window.location.reload();
  }, []);

  return { isOnline, updateAvailable, refresh };
}
