const _ = require('lodash');
const webpush = require('web-push');
const SharedData = require('components/SharedData');
const Subscription = require('models/Subscription');

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
	Subscription.find({userId: userId, type: 'webpush'})
		.then((docs) => {
			if(docs) {
				docs.forEach((doc) => {
					webpush.sendNotification(doc.data, message)
						.catch((err) => {
							if (err.statusCode === 410) {
								Subscription.remove({_id: doc._id});
							}
						});
				});
			}
		})
		.catch((err) => {
			console.warn(err);
		});
};

module.exports = {
	sendNotification: sendNotification
};
