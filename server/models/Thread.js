var mongoose = require('../shared.js').mongoose;
const Schema = mongoose.Schema;
const Message = require('./Message.js');

const schema = new Schema({
	members: ['ObjectId'],
	messages: [Message.schema]
});

module.exports = mongoose.model('Thread', schema);
