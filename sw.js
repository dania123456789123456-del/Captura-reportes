/* Service worker de Reporte Guardia — permite ABRIR la página sin Internet después de haberla abierto una vez con conexión.
   Estrategia: red primero y, si falla, la copia guardada. NO intercepta las llamadas al backend (otro origen)
   ni guarda nada de los reportes: eso vive en IndexedDB. Para publicar una versión nueva basta con cambiar CACHE. */
const CACHE = "rg-captura-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith("rg-captura-") && k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try { const res = await fetch(req); if (res && res.ok) cache.put(req, res.clone()); return res; }
    catch (err) { const hit = await cache.match(req, { ignoreSearch: true }); if (hit) return hit; throw err; }
  })());
});
