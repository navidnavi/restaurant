// نسخه 3: ابتدا از حافظه (بدون انتظار برای اینترنت)، بعد در پس‌زمینه به‌روز می‌شود
const C='rest-v3';
const SHELL=['./','./index.html','./manifest.json','./icon-192-v2.png','./icon-512-v2.png','./icon-maskable-512-v2.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.allSettled(SHELL.map(a=>c.add(new Request(a,{cache:'reload'}))))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(!(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)))return;
  const nav=r.mode==='navigate',key=nav?'./index.html':r;
  e.respondWith((async()=>{
    const c=await caches.open(C),hit=await c.match(key);
    const net=Promise.race([
      fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(key,res.clone());return res}).catch(()=>null),
      new Promise(res=>setTimeout(()=>res(null),20000))
    ]);
    if(hit){e.waitUntil(net);return hit}
    const res=await net;
    return res||(nav?(await c.match('./index.html')):null)||new Response('offline',{status:503,headers:{'Content-Type':'text/plain'}});
  })());
});
