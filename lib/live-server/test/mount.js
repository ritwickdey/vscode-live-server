var request = require('supertest');
var path = require('path');
var liveServer = require('..').start({
	root: path.join(__dirname, "data"),
	port: 0,
	open: false,
	mount: [
		[ "/mounted", path.join(__dirname, "data", "sub") ],
		[ "/style", path.join(__dirname, "data", "style.css") ]
	]
});

describe('mount tests', function() {
	it('should respond with sub.html', function(done) {
		request(liveServer)
			.get('/mounted/sub.html')
			.expect('Content-Type', 'text/html; charset=UTF-8')
			.expect(/Subdirectory/i)
			.expect(200, done);
	});
	it('should respond with style.css', function(done) {
		request(liveServer)
			.get('/style')
			.expect('Content-Type', 'text/css; charset=UTF-8')
			.expect(/color/i)
			.expect(200, done);
	});
});


