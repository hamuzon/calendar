self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'カレンダー通知';
  const options = {
    body: data.body || '予定の時間です',
    icon: '/icon.svg', // 必要に応じてアイコンパスを調整してください
    data: data.url || '/'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});