/* 壁炉 · service worker
   作用：让浏览器认得出这是个能装的 App（不只是个网页）。
   策略：
   - 大件静态库（galaxy/lib/、sky/、three 等）→ 缓存优先，一次下载，永久用。
   - 其它（自己写的代码/页面）→ 网络优先，断网退缓存，改了就立刻生效。
*/
var CACHE = 'hearth-v12';
var IMMUTABLE = /\/galaxy\/lib\/|\/sky\/|three\.module|\.woff2?$/;
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
  './manifest.json',
  './galaxy/galaxy.html',
  './galaxy/lib/three.module.js'
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
  // 大件静态资源：缓存优先（有就用，没有才下载）
  if (IMMUTABLE.test(req.url)) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
          return res;
        });
      })
    );
    return;
  }
  // 其它：网络优先，断网退缓存
  e.respondWith(
    fetch(req, { cache: 'no-cache' }).then(function (res) {
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