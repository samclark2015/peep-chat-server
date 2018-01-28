const _ = require('lodash');
const WebSocket = require('app/components/WebSocket');
const WebPush = require('app/components/WebPush');

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
