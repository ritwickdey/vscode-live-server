var request = require('supertest');
var path = require('path');
var liveServer = require('..').start({
	root: path.join(__dirname, "data"),
	port: 0,
	open: false,
	cors: true
});

describe('cors tests', function() {
	it('should respond with appropriate header', function(done) {
		request(liveServer)
			.get('/index.html')
			.set('Origin', 'http://example.com')
			.expect('Content-Type', 'text/html; charset=UTF-8')
			.expect('Access-Control-Allow-Origin', 'http://example.com')
			.expect(/Hello world/i)
			.expect(200, done);
	});
	it('should support preflighted requests', function(done) {
		request(liveServer)
			.options('/index.html')
			.set('Origin', 'http://example.com')
			.set('Access-Control-Request-Method', 'POST')
			.set('Access-Control-Request-Headers', 'X-PINGOTHER')
			.expect('Access-Control-Allow-Origin', 'http://example.com')
			.expect('Access-Control-Allow-Methods', /POST/)
			.expect('Access-Control-Allow-Headers', 'X-PINGOTHER')
			.expect(204, done);
	});
	it('should support requests with credentials', function(done) {
		request(liveServer)
			.options('/index.html')
			.set('Origin', 'http://example.com')
			.set('Cookie', 'foo=bar')
			.expect('Access-Control-Allow-Origin', 'http://example.com')
			.expect('Access-Control-Allow-Credentials', 'true')
			.expect(204, done);
	});
});


