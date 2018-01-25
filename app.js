var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var bodyParser = require('body-parser')

var passport = require('passport');
var passportJWT = require("passport-jwt");
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
let shared = require('./shared.js');
const secret = shared.secret;

// Routers
var sockets = require('./sockets.js');
var secure = require('./secure.js')(passport);

//classes
const Message = require('./classes/Message.js');
const User = require('./classes/User.js');
const Error = require('./classes/Error.js');

var users = shared.users;
var activeUsers = shared.activeUsers;

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = secret;

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('payload received', jwt_payload);
  // usually this would be a database call:
  var user = _.find(users, {id: jwt_payload.id })
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

passport.use(strategy);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(passport.initialize());
app.use('/ws', sockets);
app.use('/secure', secure)

app.post('/login', (req, res) => {
  //TODO auth & send jwt
  let {username, password} = req.body;
  let user = _.find(users, {username: username});
  if( ! user ){
    res.status(401).json({message:"no such user found"});
  }

  if(user.password === req.body.password) {
    // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
    var payload = {id: user.id};
    var token = jwt.sign(payload, jwtOptions.secretOrKey);
    res.json({message: "ok", token: token});
  } else {
    res.status(401).json({message:"passwords did not match"});
  }
});


app.listen(8080, () => console.log('Example app listening on port 8080!'))
