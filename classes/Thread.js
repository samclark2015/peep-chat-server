module.exports = class {
	constructor(id, members) {
		this.id = id; // Thread ID (UUID)
		this.members = members; // Array of User IDs
		this.messages = []; // Array of Message objects
	}
};
