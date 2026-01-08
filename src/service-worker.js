/**
 * Service Worker for Lalela Web Games
 * 
 * Caching strategy:
 * - Static assets: Cache-first (CSS, JS, images, fonts)
 * - API calls: Network-first with cache fallback
 * - Game assets: Cache-first with background update
 * 
 * @version 1.0.0
 */

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `lalela-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `lalela-dynamic-${CACHE_VERSION}`;
const API_CACHE = `lalela-api-${CACHE_VERSION}`;

// Static assets to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    // Bundle files will be added dynamically
];

// API base URL patterns
const API_PATTERNS = [
    /\/api\//,
    /localhost:8000/,
];

// Asset patterns to cache
const CACHEABLE_ASSETS = [
    /\.js$/,
    /\.css$/,
    /\.svg$/,
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.gif$/,
    /\.webp$/,
    /\.mp3$/,
    /\.wav$/,
    /\.ogg$/,
    /\.woff2?$/,
    /\.ttf$/,
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                // Skip waiting to activate immediately
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Install failed:', error);
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            // Delete old version caches
                            return cacheName.startsWith('lalela-') && 
                                   !cacheName.includes(CACHE_VERSION);
                        })
                        .map((cacheName) => {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                // Take control of all pages immediately
                return self.clients.claim();
            })
    );
});

/**
 * Fetch event - handle requests with appropriate caching strategy
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // API requests: Network-first with cache fallback
    if (isApiRequest(request.url)) {
        event.respondWith(networkFirstStrategy(request, API_CACHE));
        return;
    }
    
    // Static assets: Cache-first with network fallback
    if (isCacheableAsset(request.url)) {
        event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE));
        return;
    }
    
    // HTML pages: Network-first
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(networkFirstStrategy(request, STATIC_CACHE));
        return;
    }
    
    // Default: Try cache, then network
    event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE));
});

/**
 * Check if URL is an API request
 */
function isApiRequest(url) {
    return API_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Check if URL is a cacheable asset
 */
function isCacheableAsset(url) {
    return CACHEABLE_ASSETS.some(pattern => pattern.test(url));
}

/**
 * Cache-first strategy
 * Try cache first, fall back to network, then cache the response
 */
async function cacheFirstStrategy(request, cacheName) {
    try {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            // Return cached version, but update cache in background
            updateCache(request, cacheName);
            return cachedResponse;
        }
        
        // Not in cache, fetch from network
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache-first failed:', error);
        
        // Try to return cached version as last resort
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline fallback for HTML pages
        if (request.headers.get('accept')?.includes('text/html')) {
            return offlineFallback();
        }
        
        throw error;
    }
}

/**
 * Network-first strategy
 * Try network first, fall back to cache if offline
 */
async function networkFirstStrategy(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful GET responses
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline response for API calls
        if (isApiRequest(request.url)) {
            return offlineApiResponse();
        }
        
        // Return offline fallback for HTML pages
        if (request.headers.get('accept')?.includes('text/html')) {
            return offlineFallback();
        }
        
        throw error;
    }
}

/**
 * Update cache in background (stale-while-revalidate)
 */
async function updateCache(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse);
        }
    } catch (error) {
        // Silently fail - we already have cached version
    }
}

/**
 * Return offline fallback page
 */
function offlineFallback() {
    return new Response(
        `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Offline - Lalela Games</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #0062FF 0%, #00B378 100%);
                    color: white;
                    text-align: center;
                    padding: 20px;
                }
                h1 { font-size: 2.5rem; margin-bottom: 1rem; }
                p { font-size: 1.2rem; opacity: 0.9; max-width: 400px; }
                .emoji { font-size: 4rem; margin-bottom: 1rem; }
                button {
                    margin-top: 2rem;
                    padding: 12px 32px;
                    font-size: 1rem;
                    background: white;
                    color: #0062FF;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                }
                button:hover { transform: scale(1.05); }
            </style>
        </head>
        <body>
            <div class="emoji">📡</div>
            <h1>You're Offline</h1>
            <p>It looks like you've lost your internet connection. Some games may still be available offline!</p>
            <button onclick="window.location.reload()">Try Again</button>
        </body>
        </html>`,
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/html',
            }),
        }
    );
}

/**
 * Return offline API response
 */
function offlineApiResponse() {
    return new Response(
        JSON.stringify({
            error: 'offline',
            message: 'You are currently offline. Data will sync when connection is restored.',
            offline: true,
        }),
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'application/json',
            }),
        }
    );
}

/**
 * Handle messages from the main thread
 */
self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CACHE_ASSETS') {
        // Pre-cache specific game assets
        const { assets } = event.data;
        caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.addAll(assets);
        });
    }
    
    if (event.data.type === 'CLEAR_CACHE') {
        // Clear all caches
        caches.keys().then((cacheNames) => {
            cacheNames.forEach((cacheName) => {
                if (cacheName.startsWith('lalela-')) {
                    caches.delete(cacheName);
                }
            });
        });
    }
    
    if (event.data.type === 'GET_CACHE_STATUS') {
        // Return cache status to main thread
        getCacheStatus().then((status) => {
            event.ports[0].postMessage(status);
        });
    }
});

/**
 * Get current cache status
 */
async function getCacheStatus() {
    const cacheNames = await caches.keys();
    const status = {
        version: CACHE_VERSION,
        caches: {},
    };
    
    for (const cacheName of cacheNames) {
        if (cacheName.startsWith('lalela-')) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            status.caches[cacheName] = keys.length;
        }
    }
    
    return status;
}

/**
 * Handle push notifications (for future use)
 */
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    
    const options = {
        body: data.body || 'New activity in Lalela Games!',
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/',
        },
        actions: data.actions || [],
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Lalela Games', options)
    );
});

/**
 * Handle notification click
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const url = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Focus existing window if available
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise open new window
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

console.log('[SW] Service worker loaded, version:', CACHE_VERSION);
