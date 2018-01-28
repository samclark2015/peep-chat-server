// TODO add push services
self.addEventListener('install', function(event) {
	// The promise that skipWaiting() returns can be safely ignored.
	self.skipWaiting();

	// Perform any other actions required for your
	// service worker to install, potentially inside
	// of event.waitUntil();
});

self.addEventListener('activate', event => {
	event.waitUntil(clients.claim());
});

self.addEventListener('push', function(e) {
	var options = {
		body: e.data.text(),
		vibrate: [100, 50, 100],
		data: {
			dateOfArrival: Date.now(),
			primaryKey: '2',
			tag: 'renotify',
			renotify: true
		}
	};
	e.waitUntil(
		self.registration.showNotification('PeepChat', options)
	);
});

self.addEventListener('notificationclick', function(e) {
	const clickedNotification = e.notification;
	clickedNotification.close();

	e.waitUntil(
		clients.matchAll({
			type: 'window'
		})
			.then(function(clientList) {
				for (var i = 0; i < clientList.length; i++) {
					var client = clientList[i];
					if ('focus' in client)
						return client.focus();
				}
				if (clients.openWindow) {
					return clients.openWindow(e.currentTarget.location.origin);
				}
			})
	);

	// Do something as the result of the notification click
	/*const promiseChain =
	e.waitUntil(promiseChain);*/
});
