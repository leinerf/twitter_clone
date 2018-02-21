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
			if(foundUser === null || foundUser === undefined){
				return res.redirect('/');
			}
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

			io.instance().to(req.user._id).emit("tweet",createdTweet);
			res.json(createdTweet)
		}
	})
	
});

router.get("/:id/tweets",function(req,res,next){
	userModel.findById(req.params.id,function(err,foundUser){
		if(err){
			res.json(err);
		}
		else{
			var listOfIds = foundUser.followingIds.slice();
			listOfIds.push(req.params.id);
			
			tweetsModel.find({userId: {$in: listOfIds}},function(err,foundUsers){
				
				if(err){
					res.json(err);
				}
				else{
					
					res.json(foundUsers);
				}
			});
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
			restrictions;
			userModel.find({ _id:{ "$in": restrictions } },function(err,foundUsers){
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



router.get("/:id/nonfollowers",function(req,res,next){
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
					io.this_socket.join(req.body.follow);
					res.json(foundUser);
				}
			});
		}
	});
	

});

router.post("/:id/unfollow",function(req,res,next){
	userModel.findById(req.body._id,function(err,foundUser){
		if(err){
			
			res.json(err);
		}else{
			function remove(arr, element){
				return arr.filter(function(elem){
					return elem !== element;
				})
			}

			foundUser.followingIds = remove(foundUser.followingIds,req.body.unfollow_id);
			foundUser.save(function(err){
				if(err){
					return res.json(err);
				}
				else{
					//io.this_socket.leave(req.body.unfollow_id);
					return res.json(foundUser);
				}
			})
		}
	});
});





module.exports = router;
