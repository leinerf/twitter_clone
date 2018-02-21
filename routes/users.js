var express = require('express');
var router = express.Router();
var isAuthenticated  = require('../middleware/authentication');
var tweetsModel = require("../models/tweetsModel");
var userModel = require("../models/userModel");
var io = require("../io");
var cors = require('cors')

router.post('/share',cors(),function(req,res,next){
	console.log('it goes here share=============================')
	console.log(req.body)
	userModel.findOne({email: req.body.email},function(err,foundUser){
		if(err){
			res.json({authenticated:false})		
		}
		else if(foundUser === null || foundUser === undefined){
			res.json({authenticated:false});
		}
		else{
			if(foundUser.checkPassword(req.body.password)){
				req.session.user = foundUser;
				res.json({authenticated:true, user_id:foundUser._id,author: foundUser.twitterName});		
			}
			else{
				res.json({authenticated:false});
			}
		}
	})
	
	
})

router.post("/:id/tweets",cors(),function(req,res,next){
	console.log("==============================tweets post========================")
	console.log(req.body);
	console.log("==============================tweets post========================")
	tweetsModel.create(req.body,function(err,createdTweet){
		if(err){
			res.json(err)
		}
		else{
			var user;
			if(req && req.user && req.user._id){
				user = req.user._id
			}
			else{
				user = req.body.userId;
			}
			
			console.log("it goes here");
			io.instance().sockets.in(user).emit("tweet",createdTweet);
			res.json(createdTweet)
		}
	})
	
});

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
		console.log(req.body.follow);
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
					console.log('=============following post self============')
					console.log(req.user._id)
					console.log('=============following post============')
					console.log(req.body.follow)
					console.log('=============following post============')
					io.this_socket.join(req.body.follow);
					userModel.findById(req.body.follow,function(err, foundUser){
						if(err){
							return res.json(err);
						}
						console.log(foundUser)
						console.log("hello from post");
						return res.json(foundUser);
					})
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
					console.log('=============unfollowing post============')
					console.log(req.body.unfollow_id)
					console.log('=============unfollowing post============')
					io.this_socket.leave(req.body.unfollow_id);
					userModel.findById(req.body.unfollow_id,function(err,foundUser){
						if(err){
							return res.json(err);
						}
						return res.json(foundUser);
					})
					
				}
			})
		}
	});
});





module.exports = router;
