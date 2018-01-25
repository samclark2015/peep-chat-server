const WSMessage = require('./WSMessage.js');

module.exports = class Error extends WSMessage {
	constructor(text) {
		super('error', {
			text: text
		});
	}
};
