const mongoose = require('components/SharedData').mongoose;
const Schema = mongoose.Schema;

const schema = new Schema({
	userId: {type: Schema.Types.ObjectId, required: true},
	type: {type: String, required: true},
	data: {type: Schema.Types.Mixed, required: true}
});

module.exports = mongoose.model('Subscription', schema);
