var mongoose = require('mongoose');
var Thread = require('./classes/Thread.js');
var Message = require('./classes/Message.js');
var User = require('./classes/User.js');

let t = new Thread('4349ae8d-06c5-4ad1-b986-1b87503e821b', ['e555eb13-e20f-4e17-9738-0341f02d9ddf', '380a245f-fd24-4c59-9f48-087fa9558da6']);
t.messages.push(new Message('e555eb13-e20f-4e17-9738-0341f02d9ddf', '4349ae8d-06c5-4ad1-b986-1b87503e821b', 'Test message!!'));

let u1 = new User('e555eb13-e20f-4e17-9738-0341f02d9ddf', 'test', '12345');
let u2 = new User('380a245f-fd24-4c59-9f48-087fa9558da6', 'test1', '12345');


mongoose.connect('mongodb://localhost/chat');

module.exports = {
	mongoose: mongoose,
	secret: 'asjfoawnfoi12nronewfn',
	activeUsers: {}
	/*users: [u1, u2], //stored in mongo
	activeUsers: {}, //stored in redis?
	threads: [t]*/
};
