// public/sw.js

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json(); // Suponemos que enviamos JSON desde el backend

    const options = {
      body: data.body || 'Tienes una nueva notificación',
      icon: '/icon-192x192.png', // Asegúrate de tener un icono en public
      badge: '/badge-72x72.png', // Icono pequeño para la barra de estado
      data: {
        url: data.url || '/notifications' // Ruta a la que irá al hacer clic
      },
      vibrate: [100, 50, 100],
      actions: [
        { action: 'open', title: 'Ver ahora' },
        { action: 'close', title: 'Cerrar' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Nueva interacción', options)
    );
  }
});

// Manejar el clic en la notificación
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});