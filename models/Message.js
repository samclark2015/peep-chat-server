var mongoose = require('app/components/SharedData').mongoose;
const Schema = mongoose.Schema;

const schema = new Schema({
	sender: { type: Schema.Types.ObjectId, ref: 'User' },
	thread: 'ObjectId',
	content: 'Mixed'
});


module.exports = mongoose.model('Message', schema);
