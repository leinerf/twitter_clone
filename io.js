var cookie = require('cookie');
var session = require('client-sessions');
var userModel = require("./models/userModel")
var config = require('./config');
var io = null;




module.exports = {
	init: function(server){
		
		io = require("socket.io")(server);
		var serverIO =this 
		io.on("connection",function(socket){
			var info = null;
			serverIO.this_socket = socket;
			var something = cookie.parse(socket.handshake.headers.cookie);
			console.log(config);
			console.log("==================");
			console.log(something);
			console.log('==================');
			console.log(something['session']);
	
			if(something['session'] !== undefined){
				info = session.util.decode(config,something['session']);
			}
			
			if(info !== undefined && info !==null){
			userModel.findById(info['content']['user']['_id'],function(err,foundUser){
				if(err){
					console.log(err);
				}
				else{
			
					for(var i = 0; i < foundUser.followingIds.length; ++i){
						socket.join(foundUser.followingIds[i]);
					}
				}
			});
			}
			
			socket.on("disconnect",function(){
				console.log("user disconnected");
			});
		});
	},
	instance: function(){
		return io;
	},
	this_socket: null
};