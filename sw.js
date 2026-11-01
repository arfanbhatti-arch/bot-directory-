var CACHE="bd-v3";
var SHELL=["./","index.html","app.css","app.js","data.json","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","fonts/cormorant.ttf","fonts/inter.ttf","fonts/inter-bold.ttf"];
var LATER=["prompts-0.json","prompts-1.json"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(SHELL).then(function(){return c.addAll(LATER).catch(function(){})})}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;
 e.respondWith(fetch(e.request).then(function(r){if(r&&r.ok){var cp=r.clone();caches.open(CACHE).then(function(c){c.put(e.request,cp)})}return r}).catch(function(){return caches.match(e.request,{ignoreSearch:true}).then(function(m){return m||caches.match("index.html")})}))});
