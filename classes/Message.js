class Message {
  constructor(type, data) {
    this.type = type;
    this.payload = data;
  }
}

Message.toString = (message) => {
  return JSON.stringify(message);
}

module.exports = Message;
