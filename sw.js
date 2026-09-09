var CACHE = "dj-wilmer-v2";
var CORE = [
  "./",
  "index.html",
  "css/styles.css",
  "js/app.js",
  "manifest.webmanifest",
  "assets/img/logo.png",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-180.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(CORE);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(function () {
        return caches.match("index.html");
      })
    );
    return;
  }

  if (url.href.indexOf("get_info.php") !== -1) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (event.request.method !== "GET") { return; }

  event.respondWith(cacheFirst(event.request));
});

function cacheFirst(request) {
  return caches.match(request).then(function (hit) {
    if (hit) { return hit; }
    return fetch(request).then(function (res) {
      if (res && res.status === 200) {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
      }
      return res;
    }).catch(function () { return caches.match("./"); });
  });
}

function networkFirst(request) {
  return fetch(request).then(function (res) {
    if (res && res.status === 200) {
      var copy = res.clone();
      caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(request).then(function (hit) { return hit || caches.match("./"); });
  });
}