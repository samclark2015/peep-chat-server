var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);

//classes
const Message = require('./classes/Message.js');
const User = require('./classes/User.js');
const Error = require('./classes/Error.js');

var activeUsers = [];

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// respond with "hello world" when a GET request is made to the homepage
app.get('/users', function (req, res) {
  res.send(activeUsers.map((user) => {
    var u = Object.assign({}, user);
    delete u.socket;
    return u;
  }));
});

app.ws('/', (ws, req) => {
  var isAuth = false;
  var user = null;

  function signOn(data) {
    if(isAuth) {
      let idx = activeUsers.indexOf(user);
      activeUsers.splice(idx, 1);
    }

    user = new User(data.name, ws);
    isAuth = true;
    activeUsers.push(user);
    var cleanUser = Object.assign({}, user);
    delete cleanUser.socket;
    let message = new Message('signon', cleanUser);
    ws.send(Message.toString(message));
    console.log(req);
  }

  function sendMessage(isTyping, data) {
    if(!isAuth) {
      ws.send(Message.toString(new Error("Unauthorized user")));
      return;
    }

    let message = Message.toString(new Message(isTyping ? 'typing' : 'message', data));

    for(var user of activeUsers) {
      if(user.name === data.to) {
        user.socket.send(message);
        if(!isTyping)
          ws.send(message);
        return;
      }
    }
    ws.send(Message.toString(new Error("User not found")));
  }

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
        ws.send(Message.toString(new Error("Unknown message type")));
        break;
    }
  });

  ws.on('close', () => {
    if(isAuth) {
      let idx = activeUsers.indexOf(user);
      activeUsers.splice(idx, 1);
    }
  });

  ws.on('error', () => console.log('error'));

  ws.send(Message.toString(new Message('welcome', null)));
});

app.listen(80, () => console.log('Example app listening on port 8080!'))
