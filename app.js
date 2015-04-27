var express = require('express'),
	mongoose = require('mongoose'),
	fs = require('fs'),
	stylus = require('stylus'),
	nib = require('nib'),
	config = require('./config/config'),
	http = require('http'),
	https = require('https');

https.globalAgent.maxSockets = 100;
http.globalAgent.maxSockets = 100;

mongoose.connect(config.db_uri, {auth : config.auth});

var db = mongoose.connection;
console.log(db);
db.on('error', function () {
	throw new Error('unable to connect to database at ' + config.db);
});

var modelsPath = __dirname + '/app/models';
fs.readdirSync(modelsPath).forEach(function (file) {
	if (file.indexOf('.js') >= 0) {
		require(modelsPath + '/' + file);
	}
});

var app = express();

require('./config/express')(app, config);
require('./config/routes')(app);

app.listen(config.port);
