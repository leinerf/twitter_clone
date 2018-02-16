var msgSchema = mongoose.Schema({

	date: {type:Date, default:Date.now},
	senderId: {type: String},
	recieverId: {type: String},
	text: {type:String}
})

var msgModel = mongoose.model("tweets", msgSchema);

module.exports = msgModel;