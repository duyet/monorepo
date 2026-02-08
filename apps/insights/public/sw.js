/**
 * Service Worker for Insights Dashboard
 * Provides offline support and caching for better performance
 */

const CACHE_NAME = "insights-dashboard-v1";
const STATIC_CACHE = "insights-static-v1";
const DATA_CACHE = "insights-data-v1";

// URLs to cache on install
const PRECACHE_URLS = [
  "/",
  "/ai",
  "/github",
  "/wakatime",
  "/blog",
  "/manifest.json",
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first, fall back to network
  cacheFirst: [
    /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
    /^https:\/\/fonts\.googleapis\.com/,
    /^https:\/\/fonts\.gstatic\.com/,
  ],
  // Network first, fall back to cache
  networkFirst: [
    /\.json$/,
    /^\/api\//,
  ],
  // Stale while revalidate
  staleWhileRevalidate: [
    /\.js$/,
    /\.css$/,
  ],
};

// Install event - precache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Precaching static assets");
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName !== STATIC_CACHE &&
                cacheName !== DATA_CACHE &&
                cacheName !== CACHE_NAME
            )
            .map((cacheName) => {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - handle requests with appropriate cache strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip cross-origin requests that aren't CDN resources
  if (
    url.origin !== location.origin &&
    !CACHE_STRATEGIES.cacheFirst.some((pattern) => pattern.test(url.href))
  ) {
    return;
  }

  // Determine cache strategy
  let strategy = "networkFirst"; // default

  for (const [patternName, patterns] of Object.entries(CACHE_STRATEGIES)) {
    for (const pattern of patterns) {
      if (pattern.test(url.href) || pattern.test(url.pathname)) {
        strategy = patternName;
        break;
      }
    }
    if (strategy !== "networkFirst") break;
  }

  // Apply cache strategy
  event.respondWith(handleRequest(request, strategy));
});

/**
 * Handle request based on cache strategy
 */
async function handleRequest(request, strategy) {
  switch (strategy) {
    case "cacheFirst":
      return cacheFirst(request);
    case "networkFirst":
      return networkFirst(request);
    case "staleWhileRevalidate":
      return staleWhileRevalidate(request);
    default:
      return networkFirst(request);
  }
}

/**
 * Cache First Strategy
 * Check cache first, fall back to network
 */
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error("[SW] Cache first failed:", error);
    return new Response("Offline - Resource not cached", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

/**
 * Network First Strategy
 * Try network first, fall back to cache
 */
async function networkFirst(request) {
  const cache = await caches.open(DATA_CACHE);

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[SW] Network failed, using cache:", error.message);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback
    return new Response(
      JSON.stringify({
        error: "Offline",
        message: "No cached data available",
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Stale While Revalidate Strategy
 * Return cached content immediately, update cache in background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Fetch in background and update cache
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  // Return cached response immediately, or wait for network
  return cachedResponse || fetchPromise;
}

/**
 * Background sync for failed requests
 */
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);

  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
  }
});

/**
 * Sync data when connection is restored
 */
async function syncData() {
  try {
    // Trigger data sync for analytics
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETE",
        data: { timestamp: Date.now() },
      });
    });
  } catch (error) {
    console.error("[SW] Sync failed:", error);
  }
}

/**
 * Handle messages from clients
 */
self.addEventListener("message", (event) => {
  const { type } = event.data;

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;
    case "CACHE_CLEAR":
      clearCaches();
      break;
    case "CACHE_STATUS":
      getCacheStatus(event.ports[0]);
      break;
    default:
      break;
  }
});

/**
 * Clear all caches
 */
async function clearCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
  console.log("[SW] All caches cleared");
}

/**
 * Get cache status
 */
async function getCacheStatus(port) {
  const cacheNames = await caches.keys();
  const status = {};

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[cacheName] = keys.length;
  }

  port.postMessage({ type: "CACHE_STATUS", data: status });
}

// Note: TypeScript types for service worker should be in a separate .d.ts file
