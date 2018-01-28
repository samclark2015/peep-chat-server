const SharedData = require('components/SharedData');
const Message = require('models/Message');
const Schema = SharedData.mongoose.Schema;

const schema = new Schema({
	members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	messages: [Message.schema]
});

module.exports = SharedData.mongoose.model('Thread', schema);
