const SharedData = require('../components/SharedData');
const Message = require('../models/Message');
const Schema = SharedData.mongoose.Schema;

const schema = new Schema({
	members: [{ type: Schema.Types.ObjectId, ref: 'User', required: true}],
	messages: [{type: Message.schema, default: []}],
	inactiveMembers: [{type: Schema.Types.ObjectId, ref: 'User', default: [], select: false}]
}, {timestamps: true});

module.exports = SharedData.mongoose.model('Thread', schema);
