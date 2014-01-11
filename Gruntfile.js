'use strict';

var request = require('request');

module.exports = function (grunt) {
	// show elapsed time at the end
	require('time-grunt')(grunt);
	// load all grunt tasks
	require('load-grunt-tasks')(grunt);

	var reloadPort = 35729, files;

	grunt.initConfig({
		
		// Project settings
		yeoman: {
			// Configurable paths
			app: 'app',
			dist: 'dist'
		},

		pkg: grunt.file.readJSON('package.json'),
		develop: {
			server: {
				file: 'app.js'
			}
		},
		watch: {
			options: {
				nospawn: true,
				livereload: reloadPort
			},
			js: {
				files: [
					'app.js',
					'app/**/*.js',
					'config/*.js'
				],
				tasks: ['develop', 'delayed-livereload']
			},
			jade: {
				files: ['app/views/**/*.jade'],
				options: { livereload: reloadPort }
			},
			stylesheets: {
				files: 'public/styles/*.styl',
				tasks: [ 'stylus' ]
			},
		},

		// Empties folders to start fresh
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						'dist/'
					]
				}]
			}
		},

		copy: {
			main: {
				files: [
					// includes files within path and its sub-directories
					{	
						expand: true, 
						cwd: 'public/', 
						src: [
							'css/**', 
							'components/jquery/jquery.js', 
							'js/**', 
							'img/**'
						], 
						dest: 'dist/'
					}
				]
			}
		},

		stylus: {
			compile: {
				compress: true,
				use: [ require('nib') ],
				files: {'dist/css/app.css': 'public/styles/imports.styl'}
			}
		}
	});

	grunt.config.requires('watch.js.files');
	files = grunt.config('watch.js.files');
	files = grunt.file.expand(files);

	grunt.loadNpmTasks('grunt-contrib-stylus');

	grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
		var done = this.async();
		setTimeout(function () {
			request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function(err, res) {
					var reloaded = !err && res.statusCode === 200;
					if (reloaded)
						grunt.log.ok('Delayed live reload successful.');
					else
						grunt.log.error('Unable to make a delayed live reload.');
					done(reloaded);
				});
		}, 500);
	});

	grunt.registerTask('build', ['clean', 'stylus', 'copy']);

	grunt.registerTask('default', ['build', 'develop', 'watch']);
};
