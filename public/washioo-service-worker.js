self.addEventListener("push", (event) => {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = {
        title: "Washioo",
        body: event.data.text(),
      };
    }
  }

  const title = payload.title || "Washioo";
  const options = {
    body: payload.body || payload.message || "You have a new notification.",
    icon: "/logo_icon.png",
    badge: "/favicon.svg",
    // Mobile-specific enhancements
    vibrate: [200, 100, 200], // Vibration pattern for mobile devices
    requireInteraction: true, // Keep notification visible until user interacts
    silent: false, // Allow notification sound (browser-dependent)
    tag: payload.data?.notification_id || "washioo-notification", // Group similar notifications
    renotify: true, // Show notification even if tag matches existing one
    data: {
      url: payload.data?.url || "/",
      notification_id: payload.data?.notification_id,
      type: payload.data?.type,
      assignment_id: payload.data?.assignment_id,
      booking_id: payload.data?.booking_id,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "/",
    self.location.origin,
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (
            "focus" in client &&
            new URL(client.url).origin === self.location.origin
          ) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }

        return undefined;
      }),
  );
});
