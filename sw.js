const swVersion = "v1";

self.addEventListener("install", (event) => {
  console.log("Mise en cache de toutes les ressources");
  event.waitUntil(
    caches.open(swVersion).then((cache) => {
      console.log("Mise en cache terminée");
      return cache.addAll(["./", "./index.html", "./qrious.min.js"]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  console.log("Réponse avec le contenu du cache pour", event.request);
  caches.match(event.request).then((resp) => {
    return (
      resp ||
      fetch(event.request).then((response) => {
        return caches.open(swVersion).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    );
  });
});
