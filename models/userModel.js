var mongoose = require("mongoose");
var bcrypt = require('bcrypt');
const saltRounds = 10;


var userSchema = mongoose.Schema({
	email : {type: String, unique: true, required: true},
	username : {type: String,unique: true, required: true},
	twitterName: {type: String,unique: true, required: true},
	followingIds : [String],
	password : {type: String, required: true}
});



userSchema.methods.checkPassword = function(password){
	return bcrypt.compare(password,this.password);
}

userSchema.statics.createHash = function(password,self){
	var salt = bcrypt.genSaltSync(saltRounds);
	self.password = bcrypt.hashSync(password, salt);
	
};

var userModel = mongoose.model("users",userSchema);

module.exports = userModel;


/*

const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

let something;




var hash = bcrypt.hashSync(myPlaintextPassword, salt);


// Load hash from your password DB.
bcrypt.compare(myPlaintextPassword, hash, function(err, res) {
   if(res == true){
   		console.log("its right")
   }
   else{
   		console.log("not plain text")
   }
});


bcrypt.compare(someOtherPlaintextPassword, hash, function(err, res) {
   if(res == true){
   		console.log("its right")
   }
   else{
   		console.log("not plain text")
   }
});
*/