var createResLocals = function(req, res, next){
	res.locals.user = req.user;
	
	next();
}
module.exports = createResLocals;
