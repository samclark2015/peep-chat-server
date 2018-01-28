const webpush = require('web-push');
const SharedData = require('components/SharedData');

let vapidKeys = {
	publicKey:
'BMBsv2GwHcDxMrcdNY_6YarazWs4tWWwDFtUXuNBHL7iPPWtFZx6-8eO34lcR1nQVcMpL_GlHr1xtDp49knVqiI',
	privateKey: 'KaEstJaWp69TWvfMLScqNaMY9osE7GpFiXTi_aIrsKs'
};


webpush.setVapidDetails(
	'mailto:slc2015@icloud.com',
	vapidKeys.publicKey,
	vapidKeys.privateKey
);

let sendNotification = (userId, message) => {
	let sub = SharedData.subscriptions[userId];
	if(!sub) {
		return new Promise((res, rej) => rej('no push found'));
	}

	return webpush.sendNotification(sub, message)
		.catch((err) => {
			console.warn(err);
			if (err.statusCode === 410) {
				delete SharedData.subscriptions[userId];
				return;
			} else {
				console.log('Subscription is no longer valid: ', err);
			}
		});
};

module.exports = {
	sendNotification: sendNotification
};
