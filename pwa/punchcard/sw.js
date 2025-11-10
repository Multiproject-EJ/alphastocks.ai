// Minimal offline-first cache
const CACHE = 'punchcard-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=> c.addAll(ASSETS)));
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
});

self.addEventListener('fetch', (e)=>{
  const req = e.request;
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res=>{
      if (req.method === 'GET'){
        const resClone = res.clone();
        caches.open(CACHE).then(c=> c.put(req, resClone));
      }
      return res;
    }).catch(()=> cached))
  );
});
