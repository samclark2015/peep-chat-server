class WSMessage {
	constructor(type, data) {
		this.type = type;
		this.payload = data;
	}
}

WSMessage.toString = (message) => {
	return JSON.stringify(message);
};

module.exports = WSMessage;
