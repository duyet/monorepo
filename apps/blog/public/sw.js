// Unregister service worker and clear all caches.
// This replaces the old caching SW — with SSG, every page is
// pre-rendered HTML and doesn't need offline caching.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))))
  );
  self.clients.claim();
  self.registration.unregister();
});
