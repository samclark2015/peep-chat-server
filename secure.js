var express = require('express');
var router = express.Router();
var _ = require('lodash');

let shared = require('./shared.js');
var users = shared.users;
var activeUsers = shared.activeUsers;
var threads = shared.threads;

module.exports = (passport) => {
	router.use(passport.authenticate('jwt', { session: false }));

	router.get('/threads', (req, res) => {
		let t = _.filter(threads, (o) => _.includes(o.members, req.user.id));
		res.send(t);
	});

	router.get('/users/', (req, res) => {
		//send array of all users
		res.send(users.map((user) => {
			var u = Object.assign({}, user);
			delete u.password;
			return u;
		}));
	});

	router.get('/users/me', (req, res) => {
		let user = _.find(users, {id: req.user.id});
		var u = Object.assign({}, user);
		delete u.password;
		res.send(u);
	});

	router.get('/users/:id', (req, res) => {
		//send array of all users
		let user = _.find(users, {id: req.params.id});
		var u = Object.assign({}, user);
		delete u.password;
		res.send(u);
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
