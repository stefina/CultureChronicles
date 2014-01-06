// Generated on 2013-12-23 using generator-webapp 0.4.6
'use strict';

var request = require('request');

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);

	var reloadPort = 35729, files;

	// Define the configuration for all the tasks
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
				file: 'server.js'
			}
		},
		watch: {
			options: {
				nospawn: true,
				livereload: reloadPort
			},
			js: {
				files: [
					'server.js',
					'<%= yeoman.app %>/scripts/{,*/}*.js',
					'config/*.js'
				],
				tasks: ['develop', 'delayed-livereload', 'jshint']
			},
			jstest: {
				files: ['test/spec/{,*/}*.js'],
				tasks: ['test:watch']
			},
			gruntfile: {
				files: ['Gruntfile.js']
			},
			compass: {
				files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
				tasks: ['compass:server', 'autoprefixer']
			},
			styles: {
				files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
				tasks: ['newer:copy:styles', 'autoprefixer']
			}
		},
		// Empties folders to start fresh
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						'.tmp',
						'<%= yeoman.dist %>/*',
						'!<%= yeoman.dist %>/.git*'
					]
				}]
			},
			server: '.tmp'
		},

		// Make sure code styles are up to par and there are no obvious mistakes
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			all: [
				'Gruntfile.js',
				'<%= yeoman.app %>/scripts/{,*/}*.js',
				'!<%= yeoman.app %>/scripts/vendor/*',
				'test/spec/{,*/}*.js'
			]
		},


		// Mocha testing framework configuration options
		mocha: {
			all: {
				options: {
					run: true,
					//urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/index.html']
					urls: ['http://localhost:3000/index.html']
				}
			}
		},

		// Compiles Sass to CSS and generates necessary files if requested
		compass: {
			options: {
				sassDir: '<%= yeoman.app %>/styles',
				cssDir: '.tmp/styles',
				generatedImagesDir: '.tmp/images/generated',
				imagesDir: '<%= yeoman.app %>/images',
				javascriptsDir: '<%= yeoman.app %>/scripts',
				fontsDir: '<%= yeoman.app %>/styles/fonts',
				importPath: '<%= yeoman.app %>/bower_components',
				httpImagesPath: '/images',
				httpGeneratedImagesPath: '/images/generated',
				httpFontsPath: '/styles/fonts',
				relativeAssets: false,
				assetCacheBuster: false
			},
			dist: {
				options: {
					generatedImagesDir: '<%= yeoman.dist %>/images/generated'
				}
			},
			server: {
				options: {
					debugInfo: true
				}
			}
		},

		// Add vendor prefixed styles
		autoprefixer: {
			options: {
				browsers: ['last 1 version']
			},
			dist: {
				files: [{
					expand: true,
					cwd: '.tmp/styles/',
					src: '{,*/}*.css',
					dest: '.tmp/styles/'
				}]
			}
		},

		// Automatically inject Bower components into the HTML file
		/*'bower-install': {
			app: {
				html: '<%= yeoman.app %>/index.html',
				ignorePath: '<%= yeoman.app %>/'
			}
		},*/

		'bower-install': {
			target: {
				html: '<%= yeoman.app %>/index.html',
				src: '<%= yeoman.app %>/index.html'
			}
		},

		// Renames files for browser caching purposes
		rev: {
			dist: {
				files: {
					src: [
						'<%= yeoman.dist %>/scripts/{,*/}*.js',
						'<%= yeoman.dist %>/styles/{,*/}*.css',
						'<%= yeoman.dist %>/images/{,*/}*.{gif,jpeg,jpg,png,webp}',
						'<%= yeoman.dist %>/styles/fonts/{,*/}*.*'
					]
				}
			}
		},

		// Reads HTML for usemin blocks to enable smart builds that automatically
		// concat, minify and revision files. Creates configurations in memory so
		// additional tasks can operate on them
		useminPrepare: {
			options: {
				dest: '<%= yeoman.dist %>'
			},
			html: '<%= yeoman.app %>/index.html'
		},

		// Performs rewrites based on rev and the useminPrepare configuration
		usemin: {
			options: {
				assetsDirs: ['<%= yeoman.dist %>']
			},
			html: ['<%= yeoman.dist %>/{,*/}*.html'],
			css: ['<%= yeoman.dist %>/styles/{,*/}*.css']
		},

		// The following *-min tasks produce minified files in the dist folder
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>/images',
					src: '{,*/}*.{gif,jpeg,jpg,png}',
					dest: '<%= yeoman.dist %>/images'
				}]
			}
		},
		svgmin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>/images',
					src: '{,*/}*.svg',
					dest: '<%= yeoman.dist %>/images'
				}]
			}
		},
		htmlmin: {
			dist: {
				options: {
					collapseBooleanAttributes: true,
					collapseWhitespace: true,
					removeAttributeQuotes: true,
					removeCommentsFromCDATA: true,
					removeEmptyAttributes: true,
					removeOptionalTags: true,
					removeRedundantAttributes: true,
					useShortDoctype: true
				},
				files: [{
					expand: true,
					cwd: '<%= yeoman.dist %>',
					src: '{,*/}*.html',
					dest: '<%= yeoman.dist %>'
				}]
			}
		},

		// By default, your `index.html`'s <!-- Usemin block --> will take care of
		// minification. These next options are pre-configured if you do not wish
		// to use the Usemin blocks.
		// cssmin: {
		//     dist: {
		//         files: {
		//             '<%= yeoman.dist %>/styles/main.css': [
		//                 '.tmp/styles/{,*/}*.css',
		//                 '<%= yeoman.app %>/styles/{,*/}*.css'
		//             ]
		//         }
		//     }
		// },
		// uglify: {
		//     dist: {
		//         files: {
		//             '<%= yeoman.dist %>/scripts/scripts.js': [
		//                 '<%= yeoman.dist %>/scripts/scripts.js'
		//             ]
		//         }
		//     }
		// },
		// concat: {
		//     dist: {}
		// },

		// Copies remaining files to places other tasks can use
		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= yeoman.app %>',
					dest: '<%= yeoman.dist %>',
					src: [
						'*.{ico,png,txt}',
						'.htaccess',
						'images/{,*/}*.webp',
						'{,*/}*.html',
						'styles/fonts/{,*/}*.*',
						'bower_components/sass-bootstrap/fonts/*.*',
						'bower_components/jquery/jquery.js'
					]
				}]
			},
			styles: {
				expand: true,
				dot: true,
				cwd: '<%= yeoman.app %>/styles',
				dest: '.tmp/styles/',
				src: '{,*/}*.css'
			}
		},


		// Generates a custom Modernizr build that includes only the tests you
		// reference in your app
		modernizr: {
			devFile: '<%= yeoman.app %>/bower_components/modernizr/modernizr.js',
			outputFile: '<%= yeoman.dist %>/bower_components/modernizr/modernizr.js',
			files: [
				'<%= yeoman.dist %>/scripts/{,*/}*.js',
				'<%= yeoman.dist %>/styles/{,*/}*.css',
				'!<%= yeoman.dist %>/scripts/vendor/*'
			],
			uglify: true
		},

		// Run some tasks in parallel to speed up build process
		concurrent: {
			server: [
				'compass:server',
				'copy:styles'
			],
			test: [
				'copy:styles'
			],
			dist: [
				'compass',
				'copy:styles',
				'imagemin',
				'svgmin'
			]
		}


	});


	grunt.config.requires('watch.js.files');
	files = grunt.config('watch.js.files');
	files = grunt.file.expand(files);

	grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
		var done = this.async();
		setTimeout(function () {
			request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function(err, res) {
				var reloaded = !err && res.statusCode === 200;
				if (reloaded) {
					grunt.log.ok('Delayed live reload successful.');
				} else {
					grunt.log.error('Unable to make a delayed live reload.');
				}
				done(reloaded);
			});
		}, 500);
	});

	grunt.registerTask('test', function(target) {
		if (target !== 'watch') {
			grunt.task.run([
				'newer:jshint',
				'clean:server',
				'concurrent:test',
				'autoprefixer',
			]);
		}
	});

	grunt.registerTask('build', [
		'clean:dist',
		'useminPrepare',
		'concurrent:dist',
		'autoprefixer',
		'concat',
		'cssmin',
		'uglify',
		'copy:dist',
		'modernizr',
		// 'rev',
		'usemin',
		'htmlmin'
	]);

	grunt.registerTask('default', ['build', 'develop', 'watch']);

	grunt.registerTask('fire', ['develop', 'watch']);


};
