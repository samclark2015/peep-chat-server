const mongoose = require('../shared.js').mongoose;
const Schema = mongoose.Schema;

const schema = new Schema({
	name: String,
	username: String,
	password: {type: String, default: null, select: false}
});

module.exports = mongoose.model('User', schema);
