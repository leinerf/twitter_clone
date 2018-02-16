var mongoose = require("mongoose");

var tweetSchema = mongoose.Schema({
	date: {type:Date, default:Date.now},
	userId: {type: String,required:true},
	text: {type:String,require: true},
	likes: {type: Number,default:0},
	retweets: {type:Number,default:0},
	author: {type:String,required:true}
	
})

var tweetModel = mongoose.model("tweets", tweetSchema);

module.exports = tweetModel;