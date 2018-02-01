const mongoose = require('components/SharedData').mongoose;
const Schema = mongoose.Schema;

const schema = new Schema({
	name: { type: String, required: true },
	username: { type: String, required: true },
	password: {type: String, required: true, select: false}
}, {timestamps: true});

module.exports = mongoose.model('User', schema);
