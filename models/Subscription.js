const mongoose = require('components/SharedData').mongoose;
const Schema = mongoose.Schema;

const schema = new Schema({
	userId: Schema.Types.ObjectId,
	type: String,
	data: Schema.Types.Mixed
});

module.exports = mongoose.model('Subscription', schema);
