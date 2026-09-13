/* 壁炉 · service worker
   作用：让浏览器认得出这是个能装的 App（不只是个网页）。
   策略：网络优先，断网时退回缓存。 */

var CACHE = 'hearth-v1';
var CORE = [
  './',
  './index.html',
  './shelf.css',
  './vstore.js',
  './app.js',
  './ui.js',
  './convs.js',
  './chat.js',
  './shelf.js',
  './chatmenu.js',
  './inputbar.js',
  './guhuai.js',
  './manifest.json'
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(CORE.map(function (u) {
        return c.add(u).catch(function () {});
      }));
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  if (req.url.indexOf(self.location.origin) !== 0) return;

  e.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || caches.match('./index.html');
      });
    })
  );
});
