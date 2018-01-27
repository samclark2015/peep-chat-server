//const mongoose = require('./shared.js').mongoose;
const User = require('../server/models/User.js');
const passwordHash = require('password-hash-and-salt');

var args = process.argv.slice(2);

let name = args[0];
let username = args[1];
let password = args[2];

passwordHash(password).hash(function(error, hash) {
	if(error)
		throw new Error('Something went wrong!');

	var me = new User({ name: name, username: username, password: hash});
	me.save((err, obj) => {
		if(err)
			throw err;
		console.log(obj);
		process.exit(0);
	});
});
