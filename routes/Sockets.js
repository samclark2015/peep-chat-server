const _ = require('lodash');
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

// Models
const User = require('models/User');
const Thread = require('models/Thread');
const Message = require('models/Message');

// Components
const SharedData = require('components/SharedData');
const Notify = require('components/Notify');
//const WebPush = require('../components/WebPush')

// Classes
const WSMessage = require('classes/WSMessage');
const WSError = require('classes/WSError');

router.ws('/', (ws, req) => {
	var user = null;

	// Verify user identity on connection
	function signOn(token) {
		if(user) {
			let message = new WSError('isAuth');
			ws.send(WSMessage.toString(message));
			return;
		}

		jwt.verify(token, SharedData.secret, function(err, decoded) {
			if(err) {
				let message = new WSError(err);
				ws.send(WSMessage.toString(message));
			} else {
				user = decoded._id;
				if(!SharedData.activeUsers[user])
					SharedData.activeUsers[user] = [];
				SharedData.activeUsers[user].push(ws);

				let message = new WSMessage('signon', 'success');
				ws.send(WSMessage.toString(message));
			}
		});
	}

	// Propagate message to end user & send receipt to sender
	function handleMessage(data, isTyping) {
		if(!user) {
			// If socket not auth'd
			let message = new WSError('Unauthorized user');
			ws.send(WSMessage.toString(message));
			return;
		}

		// Find thread associated with message
		Thread.findOne({_id: data.thread}, (err, thread) => {
			if(err) {
				let message = new WSError(err);
				ws.send(WSMessage.toString(message));
				return;
			}

			// If thread exists
			if(thread) {
				// If typing notification
				if(isTyping) {
					let wsMessage = new WSMessage('typing', data);
					User.findOne({_id: data.sender}, (err, user) => {
						wsMessage.payload.sender = user; //throw user data into response object
						let text = WSMessage.toString(wsMessage); //convert response object to JSON string
						let users = _.filter(thread.members, (member) => !member.equals(data.sender));
						Notify.notifyUsers(users, text, ['websocket']);
					});
				} else {
					let message = new Message(data);
					thread.messages.push(message);
					thread.save(() => {
						Message.populate(message, 'sender', (err, savedMessage) => {
							let wsMessage = new WSMessage('message', savedMessage);
							let text = WSMessage.toString(wsMessage);
							let webpushUsers = _.filter(thread.members, (member) => !member.equals(data.sender));
							Notify.notifyUsers(thread.members, text, ['websocket']);
							Notify.notifyUsers(webpushUsers, text, ['webpush']);
						});
					});
				}
			} else {
				let message = new WSError('Thread not found');
				ws.send(WSMessage.toString());
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
			handleMessage(data.payload, true);
			break;
		case 'message':
			handleMessage(data.payload, false);
			break;
		default:
			ws.send(WSMessage.toString(new Error('Unknown message type')));
			break;
		}
	});

	// remove from active list on disconnect
	ws.on('close', () => {
		if(user) {
			_.pull(SharedData.activeUsers[user], ws);
			if(SharedData.activeUsers[user].length == 0)
				delete SharedData.activeUsers[user];
		}
	});

	ws.on('error', () => console.log('error'));

	ws.send(WSMessage.toString(new WSMessage('welcome', null)));
});

module.exports = router;
