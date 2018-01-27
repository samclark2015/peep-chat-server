var jwt = require('jsonwebtoken');
var express = require('express');
var router = express.Router();
const User = require('../models/User.js');
const Thread = require('../models/Thread.js');
const Message = require('../models/Message.js');

let shared = require('../shared.js');
const secret = shared.secret;

const _ = require('lodash');

const WSMessage = require('../classes/WSMessage.js');
//const User = require('./classes/User.js');
const Error = require('../classes/Error.js');

var activeUsers = shared.activeUsers;

router.ws('/', (ws, req) => {
	var isAuth = false;
	var user = null;

	// Verify user identity on connection
	function signOn(token) {
		if(isAuth) {
			console.warn('is auth\'d already');
			return;
		}

		jwt.verify(token, secret, function(err, decoded) {
			if(err) {
				console.warn(err);
				ws.send(WSMessage.toString(new Error(err)));
			} else {
				isAuth = true;
				user = decoded._id;
				if(!activeUsers[user])
					activeUsers[user] = [];
				activeUsers[user].push(ws);

				let message = WSMessage.toString(new WSMessage('signon', 'success'));
				ws.send(message);
			}
		});
	}

	// Propagate message to end user & send receipt to sender
	function sendMessage(isTyping, data) {
		if(!isAuth) {
			ws.send(WSMessage.toString(new Error('Unauthorized user')));
			return;
		}

		Thread.findOne({_id: data.thread}, (err, thread) => {
			if(err) {
				ws.send(WSMessage.toString(new Error(err)));
				return;
			}

			if(thread) {
				if(isTyping) {
					let wsMessage = new WSMessage('typing', data);
					User.findOne({_id: data.sender}, (err, user) => {
						wsMessage.payload.sender = user; //throw user data into response object
						let text = WSMessage.toString(wsMessage); //convert response object to JSON string

						thread.members.forEach((member) => {
							if(!user._id.equals(member)) {
								if(activeUsers[member]) {
									activeUsers[member].forEach((sock) => {
										sock.send(text);
									});
								}
							}
						});
					});


				} else {
					// TODO save sent messages to mongo
					let message = new Message(data);
					thread.messages.push(message);
					thread.save(() => {
						Message.populate(message, 'sender', (err, savedMessage) => {
							let wsMessage = new WSMessage('message', savedMessage);
							thread.members.forEach((member) => {
								let pushTest = message.sender.name + ': "'+message.content+'"';
								shared.triggerPushMsg(member, pushTest);

								if(activeUsers[member]) {
									activeUsers[member].forEach((sock) => {
										sock.send(WSMessage.toString(wsMessage));
									});
								}
							});
						});
					});
				}
			} else {
				ws.send(WSMessage.toString(new Error('Thread not found')));
			}
		});
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
		if(user) {
			_.pull(activeUsers[user], ws);
			if(activeUsers[user].length == 0)
				delete activeUsers[user];
		}
	});

	ws.on('error', () => console.log('error'));

	ws.send(WSMessage.toString(new WSMessage('welcome', null)));
});

module.exports = router;
