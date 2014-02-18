var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ReleaseGroup = mongoose.model('ReleaseGroup'),
	settings = require('../../config/ccsettings'),
	appname = settings.general.appname,
	appversion = settings.general.version,
	appurl = settings.general.url,
	resultLimit = settings.searchSettings.resultLimit;
	async = require('async'),
	NB = require('nodebrainz'),
	imdb = require('imdb-api');
var tomatoes = require('tomatoes');
var rottenTomatoes = tomatoes('hqwsh33vzge5zhnc6jzjwpsn');  // API Key

// var id = '10598';
// rottenTomatoes.get(id, function(err, result) {
//   // result: an Object with movie metadata
// });

// Initialize NodeBrainz
var nb = new NB({userAgent:'Culture Chronicles/0.0.1 ( http://my-awesome-app.com )'});;

var suggestionSchema = new Schema({
	mediaType: {type: String, enum: ['audio', 'video', 'time', 'other']},
	suggestionType: {type: String, enum: ['movie', 'music', 'time', 'other']},
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
						// fetchReleasegroupsBySearchterm(null, searchterm, function(err, result){
						// 	callback(null, result);
						// });
			getMusicSuggestionsBySearchterm(searchterm, function(err, result){
				callback(null, result);

			});
			// gather movie suggestions --> list of suggestions
/*			
			getMovieSuggestionsBySearchterm(searchterm, function(err, result){
				callback(null, result);

			});
*/
			// wrap to suggestionList --> list of all suggestions
		
	// });
	
}
/*
suggestionSchema.virtual('getSuggestionByReleasegroup').set(function(releasegroup){
	this.mediaType = 'audio';
	this.suggestionType = 'music';
	this.suggestedDate = Date.now();
	this.title = releasegroup.title;
	img_url = releasegroup.img_url;
	this.id = this._id;
	this.source = 'MusicBrainz';
});*/

suggestionSchema.virtual('rottenToSuggestion').set(function (rottenResult) {
	this.mediaType = 'video';
	this.suggestionType = 'movie';
	var suggestedDate = new Date();
	suggestedDate.setFullYear(rottenResult.year);
	this.suggestedDate = suggestedDate;
	this.title = rottenResult.title;
	this.img_url = rottenResult.posters.thumbnail;
	this.id = this._id;
	this.source = 'RottenTomatoes';

});

suggestionSchema.virtual('imdbToSuggestion').set(function (imdbResult) {
	this.mediaType = 'video';
	this.suggestionType = 'movie';
	var suggestedDate = new Date();
	suggestedDate.setFullYear(imdbResult._year_data);
	this.suggestedDate = suggestedDate;
	this.title = imdbResult.title;
	this.img_url = '';
	this.id = this._id;
	this.source = 'IMDb';
});

suggestionSchema.virtual('musicBrainzToSuggestion').set(function (releasegroup) {
	this.mediaType = 'audio';
	this.suggestionType = 'music';
	var suggestedDate = new Date();
	suggestedDate.setFullYear(releasegroup._year_data);
	this.suggestedDate = suggestedDate;
	this.title = releasegroup.title;
	img_url = releasegroup.img_url;
	this.id = this._id;
	this.source = 'MusicBrainz';
});

// CONVERTER METHODS
// var getSuggestionByReleasegroup = function(err, releasegroup, callback){

// }

// FETCHING METHODS
var getMusicSuggestionsBySearchterm = function(searchterm, callback){
	async.parallel({
		musicbrainz_result: function(callback){
			getSuggestionsFromMusicbrainz(searchterm, callback);
		}/*,
		imdb_result: function(callback){
			getSuggestionsFromIMDb(searchterm, callback);
		}*/
	},
	function(err, results) {
		if(err){
			callback(err, searchterm);
		} else {
			// var resultset = results.musicbrainz_result.concat(results.imdb_result);
			callback(null, results.musicbrainz_result);
		}
	});
}

var getMovieSuggestionsBySearchterm = function(searchterm, callback){
	async.parallel({
		rotten_result: function(callback){
			getSuggestionsFromRotten(searchterm, callback);
		},
		imdb_result: function(callback){
			getSuggestionsFromIMDb(searchterm, callback);
		}
	},
	function(err, results) {
		if(err){
			callback(err, searchterm);
		} else {
			var resultset = results.rotten_result.concat(results.imdb_result);
			callback(null, resultset);
		}
	});
}

var getSuggestionsFromRotten = function(searchterm, callback){
	rottenTomatoes.search(searchterm, function(err, result) {
		if(err){
			callback(new Error('RottenTomatoes sent an error: "' + err + '".'), searchterm);
		} else {
			var suggestionList = new Array();
			for(var i = 0; i < result.length && i < resultLimit; i++) {

				if(result[i]){
					var suggestion = new Suggestion();
					suggestion.rottenToSuggestion = result[i];

					suggestionList[i] = suggestion;
				}
			}
			callback(null, suggestionList);
		}
	});
}

var getSuggestionsFromIMDb = function(searchterm, callback){
	imdb.getReq({ name: searchterm }, function(err, result) {
		if(err){
			callback(new Error('IMDb sent an error: "' + err + '".'), searchterm);
		} else {
			var suggestionList = new Array();
			var suggestion = new Suggestion();
			suggestion.imdbToSuggestion = result;
			suggestionList[0] = suggestion;
			callback(null, suggestion);
		}
	});
}


var getSuggestionsFromMusicbrainz = function(searchterm, callback){
	fetchReleasegroupsBySearchterm(null, searchterm, function(err, result){
		
		// convert releasegroups to list of suggestions
		// use async? implement single function?

		callback(null, result);
	});
}




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
						
						console.log(result['release-groups'][i].releases[0]);

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

var Suggestion = mongoose.model('Suggestion', suggestionSchema); // local version
module.exports = mongoose.model('Suggestion', suggestionSchema); // for imports