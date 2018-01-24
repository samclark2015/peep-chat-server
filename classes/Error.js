const Message = require('./Message.js');

module.exports = class Error extends Message {
  constructor(text) {
    super('error', {
      text: text
    });
  }
}
