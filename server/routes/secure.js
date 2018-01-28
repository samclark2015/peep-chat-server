var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');
const User = require('../models/User.js');
const Thread = require('../models/Thread.js');
const webpush = require('web-push');

let shared = require('../shared.js');
var activeUsers = shared.activeUsers;
var subscriptions = shared.subscriptions;

webpush.setVapidDetails(
	'mailto:slc2015@icloud.com',
	shared.vapidKeys.publicKey,
	shared.vapidKeys.privateKey
);

shared.webpush = webpush;

shared.triggerPushMsg = function(userId, dataToSend) {
	let sub = subscriptions[userId];
	if(!sub) {
		return new Promise((res, rej) => rej('no push found'));
	}
	return webpush.sendNotification(sub, dataToSend)
		.catch((err) => {
			console.warn(err);
			if (err.statusCode === 410) {
				delete subscriptions[userId];
				return;
			} else {
				console.log('Subscription is no longer valid: ', err);
			}
		});
};

module.exports = (passport) => {
	router.use(passport.authenticate('jwt', { session: false }));

	/*router.post('/trigger-push-msg/', (req, res) => {
		Object.keys(subscriptions).forEach((user) => {
			shared.triggerPushMsg(user, 'heybaybbeee');
		});
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({ data: { success: true } }));
	});*/

	router.get('/threads', (req, res) => {
		Thread.find({members: req.user._id})
			.select(['members'])
			.populate('members')
			.exec((err, data) => {
				res.send(data);
			});
	});

	router.get('/threads/:id', (req, res) => {
		Thread.findOne({_id: req.params.id, members: req.user._id})
			.populate('members')
			.populate('messages.sender')
			.exec((err, data) => {
				res.send(data);
			});
	});

	router.post('/threads', (req, res) => {
		var usernames = req.body.members;
		usernames = usernames.map((m) =>
			m.charAt(0) == '@' ? m.substr(1) : m
		);

		//members.push(req.user._id);
		//usernames = _.uniq(usernames);
		User.find({username: {$in: usernames}}, function (err, data){
			var ids = data.map((o) => o._id.toString());
			let me = req.user._id.toString();
			ids.push(me);
			ids = _.uniq(ids);

			Thread.findOne({members: ids}, (err, data) => {
				if(!data) {
					let thread = new Thread({members: ids, messages: []});
					thread.save((err, obj) => {
						if(err)
							throw err;
						res.send(obj);
					});
				} else {
					res.send(data);
				}
			});
		});
	});

	router.delete('/threads/:id', (req, res) => {
		Thread.remove({ _id: req.params.id, members: req.user._id }, (err, data) => {
			if (err) {
				res.send(err);
				return;
			}
			if(!data) {
				res.sendStatus(404);
				return;
			}
			res.sendStatus(200);
		});
	});

	router.get('/users/', (req, res) => {
		//send array of all users
		User.find({}, (err, data) => {
			if(err) {
				res.send(err);
			}
			res.send(data);
		});
	});

	router.get('/users/me', (req, res) => {
		User.findOne({_id: req.user._id}, (err, data) => {
			if(err) {
				res.send(err);
				return;
			}
			res.send(data);
		});
	});

	router.get('/users/:id', (req, res) => {
		//send array of all users
		User.findOne({_id: req.params.id}, (err, data) => {
			if(err) {
				res.send(err);
				return;
			}
			res.send(data);
		});
	});

	router.get('/users/active', (req, res) => {
		//send array of online users
		res.send(activeUsers.map((user) => {
			var u = Object.assign({}, user);
			delete u.socket;
			return u;
		}));
	});

	router.post('/subscribe', (req, res) => {
		subscriptions[req.user._id] = req.body;
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({ data: { success: true } }));
	});

	return router;
};
