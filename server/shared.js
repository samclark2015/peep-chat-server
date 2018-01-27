const mongoose = require('mongoose');
const mongoUrl = process.env['MONGODB_URI'] || 'mongodb://localhost/chat';

mongoose.connect(mongoUrl);

module.exports = {
	mongoose: mongoose,
	secret: 'asjfoawnfoi12nronewfn',
	activeUsers: {},
	subscriptions: {},
	vapidKeys : {
		publicKey:
'BMBsv2GwHcDxMrcdNY_6YarazWs4tWWwDFtUXuNBHL7iPPWtFZx6-8eO34lcR1nQVcMpL_GlHr1xtDp49knVqiI',
		privateKey: 'KaEstJaWp69TWvfMLScqNaMY9osE7GpFiXTi_aIrsKs'
	}

	/*users: [u1, u2], //stored in mongo
	activeUsers: {}, //stored in redis?
	threads: [t]*/
};
