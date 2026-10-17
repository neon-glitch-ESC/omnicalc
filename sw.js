/* OmniCalc - service-worker.js
   Offline strategy:
   - App shell + local assets: stale-while-revalidate (instant offline load).
   - Navigations: network-first with cache fallback (so updates roll out).
   - Google Fonts (Playfair/Fira/Google Sans): cache-first runtime cache.
   - Live rate APIs: bypass the SW entirely (the app manages its own caching). */

var VERSION = 'omnicalc-v1';
var RUNTIME = 'omnicalc-runtime-v1';

var PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/fonts.css',
  './css/reset.css',
  './css/variables.css',
  './css/layout.css',
  './css/components.css',
  './css/responsive.css',
  './js/icons.js',
  './js/utils.js',
  './js/store.js',
  './js/data/units-core.js',
  './js/data/units-eng.js',
  './js/data/finance.js',
  './js/data/culinary.js',
  './js/data/apparel.js',
  './js/expr.js',
  './js/components.js',
  './js/router.js',
  './js/converters/generic.js',
  './js/converters/live.js',
  './js/converters/custom.js',
  './js/tools/numbers.js',
  './js/tools/health.js',
  './js/tools/culinary.js',
  './js/tools/apparel.js',
  './js/calculators/basic.js',
  './js/calculators/scientific.js',
  './js/calculators/programmer.js',
  './js/calculators/financial.js',
  './js/calculators/datetime.js',
  './js/calculators/graphing.js',
  './js/calculators/matrix.js',
  './js/pages/home.js',
  './js/pages/settings.js',
  './js/search.js',
  './js/app.js',
  './assets/fonts/material-symbols-outlined.woff2',
  './assets/icons/icon.svg',
  './assets/icons/icon-maskable.svg',
  './tests.html',
  './js/tests.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(VERSION).then(function (cache) {
      /* Add one-by-one so a single 404 never blocks the whole install. */
      return Promise.all(PRECACHE.map(function (url) {
        return cache.add(new Request(url, { cache: 'reload' })).catch(function () { /* ignore */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== VERSION && k !== RUNTIME) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isRateApi(url) {
  return url.hostname.indexOf('er-api.com') !== -1 ||
    url.hostname.indexOf('coingecko.com') !== -1;
}

function isFontHost(url) {
  return url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  var url;
  try { url = new URL(request.url); } catch (e) { return; }

  /* live-rate APIs: straight to network (app caches to localStorage) */
  if (isRateApi(url)) return;

  /* Google fonts: cache-first */
  if (isFontHost(url)) {
    event.respondWith(
      caches.open(RUNTIME).then(function (cache) {
        return cache.match(request).then(function (cached) {
          if (cached) return cached;
          return fetch(request).then(function (response) {
            if (response && (response.ok || response.type === 'opaque')) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(function () {
            return cached || Response.error();
          });
        });
      })
    );
    return;
  }

  if (url.origin !== location.origin) return;

  /* navigations: network-first, fallback to cached shell */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(function (response) {
        var copy = response.clone();
        caches.open(VERSION).then(function (cache) { cache.put(request, copy); });
        return response;
      }).catch(function () {
        return caches.match(request).then(function (cached) {
          return cached || caches.match('./index.html');
        });
      })
    );
    return;
  }

  /* same-origin assets: stale-while-revalidate */
  event.respondWith(
    caches.open(VERSION).then(function (cache) {
      return cache.match(request).then(function (cached) {
        var network = fetch(request).then(function (response) {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        }).catch(function () { return cached; });
        return cached || network;
      });
    })
  );
});
