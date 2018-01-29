const _ = require('lodash');
const WebSocket = require('components/WebSocket');
const WebPush = require('components/WebPush');

let notifyUsers = (users, message, protocols) => {
	let protocolsOrDefault = protocols || ['websocket', 'webpush'];
	users.forEach((user) => {
		if(_.find(protocolsOrDefault, (o) => o == 'websocket'))
			WebSocket.sendNotification(user, message);
		if(_.find(protocolsOrDefault, (o) => o == 'webpush'))
			WebPush.sendNotification(user, message);
	});
};

module.exports = {
	notifyUsers: notifyUsers
};
