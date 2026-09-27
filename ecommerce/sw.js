// SELECTED PWA Service Worker
const VERSION = 'selected-v1';
const SHELL = ['./', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return; // 登录、下单等 POST 一律走网络
  const url = new URL(req.url);

  // Supabase 数据/鉴权：永远走网络，保证账号与商品实时
  if (url.hostname.includes('supabase.co')) return;

  // 页面导航：网络优先，断网回退缓存
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put('./', copy));
        return res;
      }).catch(() => caches.match('./').then((r) => r || caches.match(req)))
    );
    return;
  }

  // 其余静态资源：缓存优先，后台更新
  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200 && (url.origin === self.location.origin || url.hostname.includes('jsdelivr.net'))) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
