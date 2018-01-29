const SharedData = require('components/SharedData');

let sendNotification = (userId, message) => {
	SharedData.activeUsers[userId].forEach((sock) => {
		sock.send(message);
	});
};

module.exports = {
	sendNotification: sendNotification
};
