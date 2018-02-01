require('dotenv').config();
require('module').Module._initPaths();
require('components/SharedData');
const Thread = require('models/Thread');

Thread.find({}).then((docs) => {
	if(docs) {
		docs.forEach((doc) =>{
			doc.messages.forEach((message) => {
				if(typeof message.content != 'object' || !message.thread || !message.content || !message.sender) {
					doc.messages.pull({_id: message._id});
				}
			});
			doc.save()
				.catch((err) => console.log(err.message, doc._id));
		});
	}
})
	.then(() => {
	})
	.catch((err) => {
		console.log(err);
	});
