var cookie = require('cookie');
var session = require('client-sessions');
var io = null;



module.exports = {
	init: function(server){
		this.server = server;
		io = require("socket.io")(server);
		io.on("connection",function(socket){
			
			var something = cookie.parse(socket.handshake.headers.cookie);
			console.log(session.util.decode({cookieName: "session",
	secret: "dOyUoKnOwThEwAy"},something['session']));
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