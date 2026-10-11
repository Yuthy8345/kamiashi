// Offline play: the page comes from the network when there is one (so updates arrive), the cache otherwise.
const V='kamiashi-v9', FONTS='kamiashi-fonts';
const CORE=['./','index.html','manifest.webmanifest','icons/apple-touch-icon.png','icons/icon-192.png','icons/icon-512.png','icons/favicon-32.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==FONTS).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const u=new URL(req.url);
  if(u.origin===location.origin){
    if(req.mode==='navigate'){
      e.respondWith(fetch(req).then(r=>{ const c=r.clone(); caches.open(V).then(ca=>ca.put('index.html',c)); return r; })
        .catch(()=>caches.match('index.html')));
      return;
    }
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{ const c=res.clone(); caches.open(V).then(ca=>ca.put(req,c)); return res; })));
    return;
  }
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open(FONTS).then(c=>c.match(req).then(r=>r||fetch(req).then(res=>{ c.put(req,res.clone()); return res; }))));
  }
});
