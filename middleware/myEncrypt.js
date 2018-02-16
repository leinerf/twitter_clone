var bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

let something;



var salt = bcrypt.genSaltSync(saltRounds);
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