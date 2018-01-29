var mongoose = require('components/SharedData').mongoose;
const Schema = mongoose.Schema;

const schema = new Schema({
	sender: { type: Schema.Types.ObjectId, ref: 'User' },
	thread: 'ObjectId',
	content: 'Mixed',
	timestamp: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Message', schema);
