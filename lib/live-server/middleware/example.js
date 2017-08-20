module.exports = function(req, res, next) {
	res.statusCode = 202;
	next();
}

