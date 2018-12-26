var _ = require('lodash');
var express = require('express');
var router = express.Router();
const User = require('../models/User');
const Thread = require('../models/Thread');
const Subscription = require('../models/Subscription');

let SharedData = require('../components/SharedData');
var activeUsers = SharedData.activeUsers;

router.use(SharedData.passport.authenticate('jwt', { session: false }));
router.get('/threads', (req, res) => {
	Thread.find({members: req.user._id})
		//.select(['members', 'createdAt', 'updatedAt'])
		.populate('members')
		.populate('messages.sender')
		.sort({'updatedAt': -1})
		.exec((err, data) => {
			res.json(data);
		});
});

router.get('/threads/short', (req, res) => {
	Thread.find({members: req.user._id})
		.select(['members', 'createdAt', 'updatedAt'])
		.populate('members')
		.sort({'updatedAt': -1})
		.exec((err, data) => {
			res.json(data);
		});
});

router.get('/threads/:id', (req, res) => {
	Thread.findOne({_id: req.params.id, members: req.user._id})
		.populate('members')
		.populate('messages.sender')
		.exec((err, data) => {
			res.json(data);
		});
});

router.post('/threads', (req, res) => {
	var usernames = req.body.members;
	usernames = usernames.map((m) =>
		m.charAt(0) == '@' ? m.substr(1) : m
	);

	User.find({username: {$in: usernames}}, function (err, data){
		var ids = data.map((o) => o._id.toString());
		let me = req.user._id.toString();
		ids.push(me);
		ids = _.uniq(ids);

		Thread.findOne({members: ids})
			.populate('members')
			.populate('messages.sender')
			.then((doc) => {
				if(!doc) {
					let thread = new Thread({members: ids, messages: []});
					thread.save()
						.then((doc) => {
							doc.populate('members')
								.populate('messages.sender',
									(err, doc) => {
										res.json(doc);
									});
						});
				} else {
					res.json(doc);
				}
			});
	});
});

router.put('/threads/:id', (req, res) => {
	var usernames = req.body.members;

	User.find({username: {$in: usernames}}, function (err, data){
		var ids = data.map((o) => {
			//console.log(o, o._id, o._id.toString());
			return o._id;
		});
		//console.log(ids);
		ids = _.uniq(ids);

		Thread.findOne({_id: req.params.id})
			.then((doc) => {
				if(!doc) {
					res.status(404);
				} else {
					var members = doc.members.slice();
					members = members.concat(ids);
					members = _.uniqWith(members, _.isEqual);
					doc.members = members;
					doc.save().then((doc) => {
						doc.populate('members')
							.populate('messages.sender',
								(err, doc) => {
									res.json(doc);
								});
					});
				}
			});
	});
});


router.delete('/threads/:id', (req, res) => {
	Thread.update(
		{ _id: req.params.id, members: req.user._id },
		{
			$pull: {members: req.user._id},
			$push: {inactiveMembers: req.user._id}
		}
	)
		.then((doc) =>{
			if(!doc)
				res.sendStatus(404);
			else {
				res.sendStatus(200);
			}
		})
		.catch((err) => res.json(err));

});

router.get('/users/', (req, res) => {
	let dbQuery = {};
	if(req.query.b) {
		dbQuery = {
			$or: [
				{username: { $regex: '^'+req.query.b+'\w*'}},
				{name: { $regex: '^'+req.query.b+'\w*'}}
			]
		};
	}
	User.find(dbQuery)
		.then((data) => {
			res.json(data);
		})
		.catch((err) => {
			res.json(err);
		});
});

router.get('/users/me', (req, res) => {
	User.findOne({_id: req.user._id}, (err, data) => {
		if(err) {
			res.json(err);
			return;
		}
		res.json(data);
	});
});

router.get('/users/:id', (req, res) => {
	//send array of all users
	User.findOne({_id: req.params.id}, (err, data) => {
		if(err) {
			res.json(err);
			return;
		}
		res.json(data);
	});
});

router.get('/users/active', (req, res) => {
	//send array of online users
	res.json(activeUsers.map((user) => {
		var u = Object.assign({}, user);
		delete u.socket;
		return u;
	}));
});

router.post('/subscribe', (req, res) => {
	let data = {
		userId: req.user._id,
		type: req.body.type,
		data: req.body.data
	};

	Subscription.find(data, (err, existing) => {
		if(existing.length == 0) {
			let subscription = new Subscription(data);
			subscription.save((err, data) => {
				if(err) {
					res.json(err);
					return;
				}
				let response = {
					success: true,
					payload: data
				};
				res.json(response);
			});
		} else {
			let response = {
				success: true,
				payload: existing
			};
			res.setHeader('Content-Type', 'application/json');
			res.json(response);
		}
	});

});

module.exports = router;
console.log('Secure router mounted');
