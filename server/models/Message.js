var mongoose = require('../shared.js').mongoose;
const Schema = mongoose.Schema;

const schema = new Schema({
	sender: 'ObjectId',
	thread: 'ObjectId',
	content: 'Mixed'
});


module.exports = mongoose.model('Message', schema);
