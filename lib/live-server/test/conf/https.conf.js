var fs = require("fs");

module.exports = {
	cert: fs.readFileSync(__dirname + "/server.cert"),
	key: fs.readFileSync(__dirname + "/server.key"),
	passphrase: "12345"
};
