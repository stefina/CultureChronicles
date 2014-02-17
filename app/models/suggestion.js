var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ReleaseGroup = mongoose.model('ReleaseGroup'),
	settings = require('../../config/ccsettings'),
	appname = settings.general.appname,
	appversion = settings.general.version,
	appurl = settings.general.url,
	async = require('async'),
	NB = require('nodebrainz');

// Initialize NodeBrainz
var nb = new NB({userAgent:'Culture Chronicles/0.0.1 ( http://my-awesome-app.com )'});;

var suggestionSchema = new Schema({
	suggestionType: {type: String, enum: ['music', 'video', 'time', 'other']},
	suggestedDate: Date,
	title: String,
	img_url: String,
	id: String,
	source: String
});

suggestionSchema.virtual('date')
	.get(function(){
		return this._id.getTimestamp();
	});

suggestionSchema.statics.findBySearchterm = function (searchterm, callback) {
	// gatherSuggestions(null, searchterm, function(err, result){

		// async.parallel action
			// gather music suggestions --> list of suggestions
			// gather movie suggestions --> list of suggestions
			// wrap to suggestionList --> list of all suggestions
		fetchReleasegroupsBySearchterm(null, searchterm, function(err, result){
			callback(null, result);
		});
	// });

	
}

suggestionSchema.methods.getSuggestionsFromRottentomatoes = function(searchterm, callback){
	// fetchMoviesBySearchterm(null, searchterm, function(err, movies){
		// convert movies to suggestions
		// return suggestions
	// });
}


suggestionSchema.methods.getSuggestionsFromMusicbrainz = function(searchterm, callback){
	fetchReleasegroupsBySearchterm(null, searchterm, function(err, releasegroups){
		// convert releasegroups to list of suggestions
		// use async? implement single function?

		callback(null, result);
	});
}

suggestionSchema.virtual('getSuggestionByReleasegroup').set(function(releasegroup){
	this.suggestionType = 'music';
	this.suggestedDate = Date.now();
	this.title = releasegroup.title;
	img_url = releasegroup.img_url;
	this.id = this._id;
	this.source = 'MusicBrainz';
});

// CONVERTER METHODS
// var getSuggestionByReleasegroup = function(err, releasegroup, callback){

// }

// FETCHING METHODS
var fetchReleasegroupsBySearchterm = function(err, searchterm, callback) {
	var limitResults = 20;
	var renderReleaseGroups = new Array();

	async.parallel({
		artist_result: function(callback){
			fetchReleasegroupsByArtist(null, searchterm, callback);
		},
		songtitle_result: function(callback){
			fetchReleasegroupsBySongtitle(null, searchterm, callback);
		}
	},
	function(err, results) {

		if(err){
			callback(err, searchterm);
		} else {

			var resultset = results.songtitle_result.concat(results.artist_result);

			// async.each(resultset, getCoverArtByReleaseGroup, function(err){
				callback(null, resultset);
			// });
		}
	});

}

var fetchReleasegroupsByArtist = function(err, searchterm, callback) {
	var limitResults = 20;
	var renderReleaseGroups = new Array();

	nb.search('release-group', {artist:searchterm, limit: limitResults}, function(err, result){
		if(err){
			callback(new Error('MusicBrainz sent an error: "' + err + '".'), searchterm);
		} else {

			if(result.count > 0) {

				for(var i = 0; i < result.count; i++) {

					if(result['release-groups'][i]){
						var releasegroup = new ReleaseGroup();
						releasegroup.setObjectFromNbResponse = result['release-groups'][i];
						// releasegroup.getCoverartByReleasegroupMbid = releasegroup.release_mbid;
						
						renderReleaseGroups[i] = releasegroup;
		
					}
				}
				callback(null, renderReleaseGroups);
			}
		}
	});
}

var fetchReleasegroupsBySongtitle = function(err, searchterm, callback) {
	var limitResults = 20;
	var renderReleaseGroups = new Array();


	nb.search('release-group', {releasegroup:searchterm, limit: limitResults}, function(err, result){
		if(err){
			callback(new Error('MusicBrainz sent an error: "' + err + '".'), searchterm);
		} else {
			if(result.count > 0) {

				for(var i = 0; i < result.count; i++) {

					if(result['release-groups'][i]){
						var releasegroup = new ReleaseGroup();
						releasegroup.setObjectFromNbResponse = result['release-groups'][i];

						// console.log(releasegroup);
						renderReleaseGroups[i] = releasegroup;
		
					}
				}
				callback(null, renderReleaseGroups);
			}
		}
	});
}



mongoose.model('Suggestion', suggestionSchema);

