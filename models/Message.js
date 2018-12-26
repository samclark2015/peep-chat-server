var mongoose = require('../components/SharedData').mongoose;
const Schema = mongoose.Schema;

const schema = new Schema({
	sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	thread: { type: Schema.Types.ObjectId, ref: 'Thread', required: true },
	content: { type: Schema.Types.Mixed, required: true },
	timestamp: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Message', schema);
