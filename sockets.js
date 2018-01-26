var jwt = require('jsonwebtoken');
var express = require('express');
var router = express.Router();

let shared = require('./shared.js');
const secret = shared.secret;

const _ = require('lodash');

const WSMessage = require('./classes/WSMessage.js');
//const User = require('./classes/User.js');
const Error = require('./classes/Error.js');

var users = shared.users;
var activeUsers = shared.activeUsers;

router.ws('/', (ws, req) => {
	var isAuth = false;
	var user = null;

	// Verify user identity on connection
	function signOn(token) {
		if(isAuth) {
			// TODO error if auth
			return;
		}

		jwt.verify(token, secret, function(err, decoded) {
			if(err) {
				console.warn(err);
				ws.send(WSMessage.toString(new Error(err)));
			} else {
				isAuth = true;
				user = decoded.id;
				activeUsers[user] = ws;

				let message = WSMessage.toString(new WSMessage('signon', 'success'));
				ws.send(message);
				// console.log(user.id + " online")
			}
		});
	}

	// Propagate message to end user & send receipt to sender
	function sendMessage(isTyping, data) {
		if(!isAuth) {
			ws.send(WSMessage.toString(new Error('Unauthorized user')));
			return;
		}

		let message = WSMessage.toString(new WSMessage(isTyping ? 'typing' : 'message', data));

		let user = _.find(users, {id: message.to});
		if(user) {
			user.socket.send(message);
			if(!isTyping)
				ws.send(message);
		} else {
			ws.send(WSMessage.toString(new Error('User not found')));
		}
	}

	// Parse WS 'requests'
	ws.on('message', (message) => {
		let data = JSON.parse(message);
		switch(data.type) {
		case 'signon':
			signOn(data.payload);
			break;
		case 'typing':
			sendMessage(true, data.payload);
			break;
		case 'message':
			sendMessage(false, data.payload);
			break;
		default:
			ws.send(WSMessage.toString(new Error('Unknown message type')));
			break;
		}
	});

	// remove from active list on disconnect
	ws.on('close', () => {
		if(isAuth) {
			let idx = activeUsers.indexOf(user);
			activeUsers.splice(idx, 1);
		}
	});

	ws.on('error', () => console.log('error'));

	ws.send(WSMessage.toString(new WSMessage('welcome', null)));
});

module.exports = router;
