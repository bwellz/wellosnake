'use strict';

var init = require('./config/init')(),
	config = require('./config/config');

// Init the express application
var app = require('./config/express')();

// Start the app by listening on <port>
app.listen(config.port);

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('Wello Snake started on port ' + config.port);