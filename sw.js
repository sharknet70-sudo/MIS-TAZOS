const CACHE_NAME='mis-tazos-v3';
const ASSETS=[
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('message',e=>{
  if(e.data && e.data.type==='SKIP_WAITING')self.skipWaiting();
});

// Estrategia: primero internet (siempre la versión más nueva); si no hay conexión, usa la copia guardada.
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request,{cache:'no-cache'}).then(resp=>{
      if(resp && resp.status===200){
        const clone=resp.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(e.request,clone));
      }
      return resp;
    }).catch(()=>
      caches.match(e.request).then(cached=>cached||caches.match('./index.html'))
    )
  );
});
