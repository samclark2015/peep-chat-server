const _ = require('lodash');
const WebSocket = require('components/WebSocket');
const WebPush = require('components/WebPush');

let notifyUsers = (users, message, protocols) => {
	let protocolsOrDefault = protocols || ['websocket', 'webpush'];
	users.forEach((user) => {
		if(_.find(protocolsOrDefault, 'websocket'))
			WebSocket.sendNotification(user, message);
		if(_.find(protocolsOrDefault, 'webpush'))
			WebPush.sendNotification(user, message);
	});
};

module.export = {
	notifyUsers: notifyUsers
};
