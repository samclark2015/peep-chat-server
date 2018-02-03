const path = require('path');
require('dotenv').config({path: path.resolve(process.cwd(), '.env.development')});
require('module').Module._initPaths();

const _ = require('lodash');

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
require('express-ws')(app); //express-ws

const passport = require('passport');
const passportJWT = require('passport-jwt');
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const passwordHash = require('password-hash-and-salt');

// Models
const User = require('models/User.js');

// Passport Setup
let SharedData = require('components/SharedData');
SharedData.passport = passport;

const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = SharedData.secret;

const strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
	// usually this would be a database call:
	User.findOne({_id: jwt_payload._id}, (err, data) => {
		if(err) {
			next(err, data);
		} else if (data) {
			next(null, data);
		} else {
			next(null, false);
		}
	});
});

passport.use(strategy);

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	res.header('Access-Control-Allow-METHODS', 'GET, POST, PUT, DELETE');
	if ('OPTIONS' == req.method) {
		res.sendStatus(200);
	}
	else {
		next();
	}
});

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
}));

app.use(passport.initialize());

console.log('Middleware initialized');

// Routes
const sockets = require('routes/Sockets');
const secure = require('routes/Secure');
app.use('/api/ws', sockets);
app.use('/api/secure', secure);

app.post('/api/login', (req, res) => {
	//TODO auth & send jwt
	let {username, password} = req.body;
	User.findOne({username: username}, 'username password')
		.then((data) => {
			if( !data ){
				res.status(401).json({message:'no such user found'});
				return;
			}

			passwordHash(password).verifyAgainst(data.password, function(error, verified) {
				if(error) {
					res.sendStatus(500).send(error);
					throw error;
				}
				if(!verified) {
					res.sendStatus(401);
				} else {
					const payload = {_id: data._id};
					const token = jwt.sign(payload, jwtOptions.secretOrKey);
					res.json({message: 'ok', token: token});
				}
			});
		})
		.catch((err)=> {
			res.json(err);
		});
});

app.post('/api/signup', (req, res) => {
	let name = _.get(req, 'body.name');
	let username = _.get(req, 'body.username');
	let password = _.get(req, 'body.password');
	let passwordConfirmation = _.get(req, 'body.confirmation');

	if(password != passwordConfirmation) {
		res.status(400).json('Password mismatch');
		return;
	}

	passwordHash(password).hash(function(error, hash) {
		if(error)
			res.status(400).json(error);

		var me = new User();
		User.create({ name: name, username: username, password: hash})
			.then((doc) => {
				let obj = doc.toObject();
				delete obj.password;
				res.status(201).json(obj);
			})
			.catch((err) => {
				res.status(500).json(err);
			});
	});

});

//var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);

/*let httpListener = httpServer.listen(process.env.PORT || 3000, () => {
	console.log('App listening on port ' + httpListener.address().port);
});*/

let listener = app.listen(process.env.PORT || 3000, () => {
	console.log('App listening on port ' + listener.address().port);
});
