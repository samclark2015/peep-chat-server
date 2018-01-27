var express = require('express');
var router = express.Router();
var _ = require('lodash');
const User = require('../models/User.js');
const Thread = require('../models/Thread.js');

let shared = require('../shared.js');
var activeUsers = shared.activeUsers;

module.exports = (passport) => {
	router.use(passport.authenticate('jwt', { session: false }));

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
		usernames = _.uniq(usernames);
		User.find({username: {$in: usernames}}, function (err, data){
			var ids = data.map((o) => o._id);
			ids.push(req.user._id);
			ids = _.uniq(ids);
			let thread = new Thread({members: ids, messages: []});
			thread.save((err, obj) => {
				if(err)
					throw err;
				res.send(obj);
			});
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

	return router;
};
