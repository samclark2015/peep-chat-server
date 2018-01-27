const mongoose = require('mongoose');
const mongoUrl = process.env['MONGODB_URI'] || 'mongodb://localhost/chat';

mongoose.connect(mongoUrl);

module.exports = {
	mongoose: mongoose,
	secret: 'asjfoawnfoi12nronewfn',
	activeUsers: {}
	/*users: [u1, u2], //stored in mongo
	activeUsers: {}, //stored in redis?
	threads: [t]*/
};
