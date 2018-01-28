const mongoose = require('mongoose');
const mongoUrl = process.env['MONGODB_URI'] || 'mongodb://localhost/chat';

mongoose.connect(mongoUrl);

module.exports = {
	mongoose: mongoose,
	secret: 'asjfoawnfoi12nronewfn',
	activeUsers: {},
	subscriptions: {}
};
