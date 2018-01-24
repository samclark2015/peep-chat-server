const WebSocket = require('ws');
const Message = require('./classes/Message.js');
const User = require('./classes/User.js');
const Error = require('./classes/Error.js');

const wss = new WebSocket.Server({
  port: 8080
});

var activeUsers = [];

wss.on('connection', (ws) => {
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
