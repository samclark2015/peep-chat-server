// TODO add push services
self.addEventListener('push', function(e) {
	var options = {
		body: e.data.text(),
		vibrate: [100, 50, 100],
		data: {
			dateOfArrival: Date.now(),
			primaryKey: '2'
		}
	};
	e.waitUntil(
		self.registration.showNotification('PeepChat', options)
	);
});
