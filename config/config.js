var path = require('path'),
		rootPath = path.normalize(__dirname + '/..'),
		env = process.env.NODE_ENV || 'development';

var config = {
	development: {
		root: rootPath,
		app: {
			name: 'culturechronicles'
		},
		port: 3000,
		db: 'mongodb://localhost/culturechronicles-development'
	},

	test: {
		root: rootPath,
		app: {
			name: 'culturechronicles'
		},
		port: 3000,
		db: 'mongodb://localhost/culturechronicles-test'
	},

	production: {
		root: rootPath,
		app: {
			name: 'culturechronicles'
		},
		port: 3000,
		db: 'mongodb://localhost/culturechronicles-production'
	}
};

module.exports = config[env];
