var express = require('express');
var router = express.Router();
var _ = require('lodash');
const User = require('models/User');
const Thread = require('models/Thread');
const Subscription = require('models/Subscription');

let SharedData = require('components/SharedData');
var activeUsers = SharedData.activeUsers;

router.use(SharedData.passport.authenticate('jwt', { session: false }));
router.get('/threads', (req, res) => {
	Thread.find({members: req.user._id})
		//.select(['members', 'createdAt', 'updatedAt'])
		.populate('members')
		.slice('messages', 1)
		.populate('messages')
		.sort({'updatedAt': -1})
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

	User.find({username: {$in: usernames}}, function (err, data){
		var ids = data.map((o) => o._id.toString());
		let me = req.user._id.toString();
		ids.push(me);
		ids = _.uniq(ids);

		Thread.findOne({members: ids}, (err, data) => {
			if(!data) {
				let thread = new Thread({members: ids, messages: []});
				thread.save((err, obj) => {
					if(err){
						res.send(err);
						return;
					}
					res.send(obj);
				});
			} else {
				res.send(data);
			}
		});
	});
});

router.delete('/threads/:id', (req, res) => {
	/*Thread.remove({ _id: req.params.id, members: req.user._id }, (err, data) => {
		if (err) {
			res.send(err);
			return;
		}

		if(!data) {
			res.sendStatus(404);
			return;
		}
		res.sendStatus(200);
	});*/
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
		.catch((err) => res.send(err));

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
					res.send(err);
					return;
				}
				let response = {
					success: true,
					payload: data
				};
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify(response));
			});
		} else {
			let response = {
				success: true,
				payload: existing
			};
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(response));
		}
	});

});

module.exports = router;
console.log('Secure router mounted');
