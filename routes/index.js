var express = require('express');
var router = express.Router();
var userModel = require('../models/userModel');




/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.session && req.session.user && req.user){
		res.redirect("/users/" + req.user.id)
	}
	else{
  		res.redirect('/login');
	}
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post("/login",function(req, res, next){
	

	userModel.findOne({email:req.body.email},function(err,foundUser){
		
		if(err){
			res.json(err);
		}
		else if(foundUser === null){
			res.render("login",{msg:"Email not found"});
		}
		else{
			if(foundUser.checkPassword(req.body.password)){
				req.session.user = foundUser;
				res.redirect("/users/" + foundUser.id);
			}
			else{
				res.render("login",{msg:"Password incorrect"});
			}
		}
	})

	
});

router.post('/logout',function(req, res, next){
	req.session.reset();
	res.redirect("/login");
});

router.post('/register',function(req, res, next){
	
	userModel.createHash(req.body.password,req.body);
	userModel.create(req.body,function(err,newUser){
		if(err){
			if(err.code === 11000){
				var formData = {
					email: false,
					username: false,
					tagname: false,
				}
				userModel.count({email:req.body.email},function(err,count){
					if(err){
						return res.json({msg:"something went wrong try again",code:2});
					}
					else if(count > 0){
						formData.email = true;
					}
					userModel.count({twitterName:req.body.twitterName},function(err,count){
						if(err){
							return res.json({msg:"something went wrong try again",code:2});
						}
						else if(count > 0){
							formData.tagname = true;		
						}
						userModel.count({username:req.body.username},function(err,count){
							if(err){
								return res.json({msg:"something went wrong try again",code:2});
							}
							else if(count > 0){
								formData.username = true;	
							}
							return res.json({taken: formData, code: 1})
						});
					});
				});
			} else{
				res.json({msg:"something went wrong try again",code:2});
			}
		} else {
			res.json({user:newUser,code:3});
		}
		
	});
});
module.exports = router;
