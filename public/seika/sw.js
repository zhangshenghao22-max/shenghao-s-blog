// sw.js — 离线壳缓存（站点可达 /seika/ 子目录下）
// 原则：代码与图标走缓存优先；提示词 / 存档等"内容"永远走网络，保证改了就生效。
const CACHE = 'seika-shell-v22';
const BASE = new URL('./', self.location).pathname;   // 自动适配部署路径
const SHELL = [
  BASE,
  BASE + 'index.html',
  BASE + 'style.css',
  BASE + 'app.js',
  BASE + 'manifest.webmanifest',
  BASE + 'icons/icon-180.png',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 这些从不缓存：人设提示词、世界提示词、种子/导入数据
function isContent(pathname) {
  if (/skin-.*\.css$/i.test(pathname)) return true;
  return /\.(txt|json)$/i.test(pathname) || /\/seeds\//.test(pathname) || /\/imports\//.test(pathname);
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin !== location.origin) return;          // 上游 API 直连，不拦截
  if (!url.pathname.startsWith(BASE)) return;          // 只管本子目录
  if (isContent(url.pathname)) return;                 // 内容类：交给网络，永远最新

  e.respondWith(
    caches.match(e.request).then((hit) => {
      const net = fetch(e.request).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => hit || caches.match(BASE + 'index.html'));
      return hit || net;
    })
  );
});













