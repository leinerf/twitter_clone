var mongoose = require("mongoose");
var faker = require("faker");
var userModel = require('./userModel');
var tweetModel = require('./tweetsModel');
var bcrypt = require('bcrypt');
const saltRounds = 10;


mongoose.connect("mongodb://localhost/ghetto-twitter");
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	console.log('CONNECTED TO THE DATABASE');
});


for(var i = 0; i < 3; ++i){
	var salt = bcrypt.genSaltSync(saltRounds);
    userModel.create({
        username: faker.internet.userName(),
        twitterName:"@" + faker.internet.userName(),
        email: faker.internet.email(),
        password: bcrypt.hashSync("hello", salt)

    });
}

// var tweetSchema = mongoose.Schema({
//     date: {type:Date, default:Date.now},
//     userId: {type: String},
//     text: {type:String}
// });





