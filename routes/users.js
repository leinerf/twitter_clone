var express = require('express');
var router = express.Router();
var isAuthenticated  = require('../middleware/authentication');
var tweetsModel = require("../models/tweetsModel");
var userModel = require("../models/userModel");
var io = require("../io");


router.use(isAuthenticated);

/* GET users listing. */
router.get('/:id/', function(req, res, next) {
	userModel.findById(req.user._id,function(err,foundUser){
		if(err){
			res.json(err)
		}
		else{
			
			res.render("userFeed",{followingIds:foundUser.followingIds});
		}
	})
	
});

router.get('/:id/profile/', function(req, res, next) {
  res.render("user")
});


router.post("/:id/tweets",function(req,res,next){
	tweetsModel.create(req.body,function(err,createdTweet){
		if(err){
			res.json(err)
		}
		else{
			console.log(req.user._id)
			var nsp = io.instance().of("/" +req.user._id);
			io.instance().to("/" +req.user._id).emit("tweet",createdTweet);
			res.json(createdTweet)
		}
	})
	
});

router.get("/:id/tweets",function(req,res,next){
	
	var listOfIds = req.user.followingIds.slice();
	listOfIds.push(req.params.id);
	tweetsModel.find({userId: {$in: listOfIds}},function(err,foundUsers){
		
		if(err){
			res.json(err);
		}
		else{
			
			res.json(foundUsers);
		}
	});
})

router.get("/:id/followers",function(req,res,next){
	var id = req.params.id


	userModel.findById(id,function(err,foundUser){
		if(err){
			res.json(err)
		}
		else if(foundUser === undefined || foundUser === null){
			res.json({msg:"could not find user"});
		}
		else{
			var restrictions = foundUser.followingIds.slice();
			restrictions.push(id);
			userModel.find({ _id:{ "$nin": restrictions } },function(err,foundUsers){
				if(err){
					res.json(err);
				}
				else{
					res.json(foundUsers)
				}
			}); // `query` is an instance of `Query`
		}
	})

});

router.post("/:id/followers",function(req,res,next){
		userModel.findById(req.user._id, function(err,foundUser){
		if(err){
			res.json(err);
		}
		else if(foundUser === undefined || foundUser === null){
			res.json({msg:"user not found"});
			res.redirect('/');
		}
		else{
			if(!foundUser.followingIds.includes(req.body.follow)){
				foundUser.followingIds.push(req.body.follow);	
			}
			foundUser.save(function(err){
				if(err){
					res.json(err);
				}
				else{
					io.instance().on("connection",function(socket){
						socket.join(req.user._id);
						for(var i = 0; i < foundUser.followingIds; ++i ){
							socket.join(foundUser.followingIds[i]);
						}
					})

					res.json(foundUser);
				}
			});
		}
	});
	

});






module.exports = router;
