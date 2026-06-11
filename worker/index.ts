/// <reference lib="webworker" />
export default null
declare const self: ServiceWorkerGlobalScope

self.addEventListener('push', (event: any) => {
  if (!event.data) return

  try {
    const data = event.data.json()
    const title = data.title || 'PredictCup Notification'
    const options: NotificationOptions = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      // @ts-ignore - TS DOM lib sometimes misses vibrate
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
      },
      requireInteraction: data.requireInteraction || false,
    }

    event.waitUntil(self.registration.showNotification(title, options))
  } catch (error) {
    console.error('Error handling push event:', error)
  }
})

self.addEventListener('notificationclick', (event: any) => {
  event.notification.close()
  
  const urlToOpen = event.notification.data?.url || '/'

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients: readonly any[]) => {
      let matchingClient = null
      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i]
        if (windowClient.url === urlToOpen) {
          matchingClient = windowClient
          break
        }
      }

      if (matchingClient) {
        return matchingClient.focus()
      } else {
        return self.clients.openWindow(urlToOpen)
      }
    })
  )
})
