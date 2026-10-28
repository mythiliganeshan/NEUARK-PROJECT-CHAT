const CACHE_NAME = 'neuark-pwa-shell-v1';
const APP_ROOT = self.registration.scope;
const APP_INDEX = new URL('index.html', APP_ROOT).href;
const CORE_ASSETS = [
  APP_INDEX,
  new URL('styles.css', APP_ROOT).href,
  new URL('app.js', APP_ROOT).href,
  new URL('i18n.js', APP_ROOT).href,
  new URL('pwa.js', APP_ROOT).href,
  new URL('manifest.webmanifest', APP_ROOT).href,
  new URL('assets/image.png', APP_ROOT).href,
  new URL('assets/pwa-180.png', APP_ROOT).href,
  new URL('assets/pwa-192.png', APP_ROOT).href,
  new URL('assets/pwa-512.png', APP_ROOT).href,
  new URL('assets/garden-birds.ogg', APP_ROOT).href,
  new URL('assets/garden-wind.ogg', APP_ROOT).href
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('neuark-pwa-') && key !== CACHE_NAME).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

function serveCachedByteRange(request) {
  return caches.match(request.url).then(async cached => {
    if (!cached) return fetch(request);
    const bytes = await cached.arrayBuffer();
    const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') || '');
    if (!match) return cached;
    const total = bytes.byteLength;
    let start = match[1] ? Number(match[1]) : Math.max(0, total - Number(match[2]));
    let end = match[2] && match[1] ? Math.min(Number(match[2]), total - 1) : total - 1;
    if (start >= total || start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${total}` } });
    const headers = new Headers(cached.headers);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Range', `bytes ${start}-${end}/${total}`);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(bytes.slice(start, end + 1), { status: 206, statusText: 'Partial Content', headers });
  });
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.headers.has('range')) {
    event.respondWith(serveCachedByteRange(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (!response.ok) return response;
      return caches.open(CACHE_NAME).then(cache => cache.put(APP_INDEX, response.clone())).then(() => response);
    }).catch(async () => (await caches.match(APP_INDEX)) || Response.error()));
    return;
  }

  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (!response.ok || response.type !== 'basic') return response;
    return caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone())).then(() => response);
  })).catch(async () => (await caches.match(request)) || Response.error()));
});
