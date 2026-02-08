"use client";

import { useEffect, useState } from "react";

export function ServiceWorkerRegister() {
  const [_canInstall, setCanInstall] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check if service worker is supported
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      setCanInstall(true);

      // Register service worker
      const _wb = window.workbox;

      // Add event listeners for offline/online status
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Check initial status
      setIsOffline(!navigator.onLine);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // Simple manual service worker registration without workbox
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("Service Worker registration failed: ", registrationError);
        });

      // Add event listeners for offline/online status
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Check initial status
      setIsOffline(!navigator.onLine);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // Show offline indicator
  if (isOffline) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
          <span className="text-sm font-medium">You are offline. Some content may be unavailable.</span>
        </div>
      </div>
    );
  }

  return null;
}
