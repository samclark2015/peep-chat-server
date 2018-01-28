const WSMessage = require('classes/WSMessage');

module.exports = class WSError extends WSMessage {
	constructor(text) {
		super('error', {
			text: text
		});
	}
};
