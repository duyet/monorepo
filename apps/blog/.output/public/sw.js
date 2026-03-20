// Blog Service Worker for Offline Reading
// Version: 1.0.0

const CACHE_NAME = "blog-cache-v1";
const STATIC_CACHE = "static-cache-v1";

// Assets to cache immediately on install
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/icon.svg",
  // Add other critical static assets here
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first, fall back to network (for static assets)
  cacheFirst: async (request) => {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(request);
      await cache.put(request, response.clone());
      return response;
    } catch (error) {
      // Return cached version or error
      return cache.match(request) || new Response("Offline", { status: 503 });
    }
  },

  // Network first, fall back to cache (for HTML pages)
  networkFirst: async (request) => {
    const cache = await caches.open(CACHE_NAME);

    try {
      const response = await fetch(request);
      // Cache successful responses
      if (response.status === 200) {
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
      // Return offline page or error
      return cache.match("/offline") || new Response("Offline", { status: 503 });
    }
  },

  // Stale while revalidate (for API calls and dynamic content)
  staleWhileRevalidate: async (request) => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    // Fetch in background
    const fetchPromise = fetch(request).then((response) => {
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    });

    // Return cached version immediately, or wait for network
    return cached || fetchPromise;
  },
};

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - route requests to appropriate cache strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Route to appropriate strategy based on request type
  if (request.destination === "document") {
    // HTML pages - network first for fresh content
    event.respondWith(CACHE_STRATEGIES.networkFirst(request));
  } else if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image"
  ) {
    // Static assets - cache first
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request));
  } else {
    // Other requests - stale while revalidate
    event.respondWith(CACHE_STRATEGIES.staleWhileRevalidate(request));
  }
});

// Background sync for failed requests (optional enhancement)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-posts") {
    event.waitUntil(
      // Sync logic here (e.g., retry failed requests)
      Promise.resolve()
    );
  }
});
