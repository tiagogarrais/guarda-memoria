const CACHE_NAME = "guarda-memoria-v2";
const urlsToCache = [
  "/",
  "/manifest.json",
  "/auth/signin",
  "/selecionar-localizacao",
  // Adicionar outras rotas importantes conforme necessário
];

// Recursos estáticos para cache
const staticAssets = [
  "/_next/static/",
  "/_next/image",
];

self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching app shell");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating.");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Estratégia Cache First para recursos estáticos
  if (event.request.url.includes("_next/static/") ||
      event.request.url.includes("_next/image")) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((response) => {
          // Cache recursos estáticos quando baixados
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
  // Estratégia Network First para páginas dinâmicas
  else if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/");
      })
    );
  }
  // Estratégia Cache First para outros recursos
  else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Notificações push (opcional - pode ser implementado depois)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received.");
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/")
  );
});
