/// <reference lib="webworker" />
import { build, files, version } from '$service-worker';

const worker=self as unknown as ServiceWorkerGlobalScope;
const cacheName=`merge-stack-${version}`;
const assets=[...build,...files];

worker.addEventListener('install',(event)=>{
  event.waitUntil(caches.open(cacheName).then(cache=>cache.addAll(assets)).then(()=>worker.skipWaiting()));
});

worker.addEventListener('activate',(event)=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==cacheName).map(key=>caches.delete(key)))).then(()=>worker.clients.claim()));
});

worker.addEventListener('fetch',(event)=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==worker.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(cacheName).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(response=>response??caches.match('/')).then(response=>response??Response.error())));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached??fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(cacheName).then(cache=>cache.put(event.request,copy))}return response})));
});
