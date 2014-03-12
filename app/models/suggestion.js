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
	imdb = require('imdb-api'),
	CA = require('coverart');
var tomatoes = require('tomatoes');
var rottenTomatoes = tomatoes('vz6vpwy4ngpkfhxqmcrmfz23');  // API Key

// ============================ Initialize APIS ============================ //
// Initialize Cover Art
var ca = new CA({userAgent: appname + '/' + appversion + ' ( ' + appurl + ' )'});
// Initialize NodeBrainz
var nb = new NB({userAgent:'Culture Chronicles/0.0.1 ( http://my-awesome-app.com )'});;

var suggestionSchema = new Schema({
	mediaType: {type: String, enum: ['audio', 'video', 'time', 'other']},
	mediaSubtype: {type: String, enum: ['movie', 'music', 'time', 'other']},
	suggestedDate: Date,
	title: String,
	img_url: String,
	id: String,
	source: String,
	year: String,
	release_mbid: String
});

suggestionSchema.virtual('date')
	.get(function(){
		return this._id.getTimestamp();
	});

suggestionSchema.statics.findBySearchterm = function (searchterm, callback) {

	async.parallel({
		// music_result: function(callback){
		// 	getMusicSuggestionsBySearchterm(searchterm, callback);
		// },
		movie_result: function(callback){
			getMovieSuggestionsBySearchterm(searchterm, callback);
		}
	},
	function(err, results) {
		if(err){
			callback(err, searchterm);
		} else {
			// var resultset = results.music_result.concat(results.movie_result);
			var resultset = results.movie_result;
			callback(null, resultset);
		}
	});
}

suggestionSchema.virtual('rottenToSuggestion').set(function (rottenResult) {
	this.mediaType = 'video';
	this.mediaSubtype = 'movie';
	var suggestedDate = new Date();
	suggestedDate.setFullYear(rottenResult.year);
	this.year = rottenResult.year;
	this.suggestedDate = suggestedDate;
	this.title = rottenResult.title;
	this.img_url = rottenResult.posters.thumbnail;
	this.id = this._id;
	this.source = 'RottenTomatoes';
});

suggestionSchema.virtual('imdbToSuggestion').set(function (imdbResult) {
	this.mediaType = 'video';
	this.mediaSubtype = 'movie';
	var suggestedDate = new Date();
	suggestedDate.setFullYear(imdbResult._year_data);
	this.year = imdbResult._year_data;
	this.suggestedDate = suggestedDate;
	this.title = imdbResult.title;
	this.img_url = '';
	this.id = this._id;
	this.source = 'IMDb';
});

suggestionSchema.virtual('musicBrainzToSuggestion').set(function (releasegroup) {
	this.mediaType = 'audio';
	this.mediaSubtype = 'music';
	// var suggestedDate = new Date();
	// suggestedDate.setFullYear(releasegroup._year_data);
	// this.suggestedDate = suggestedDate;
	this.title = releasegroup.title;
	// img_url = releasegroup.img_url;
	this.id = this._id;
	this.source = 'MusicBrainz';

	this.release_mbid = releasegroup.releases[0].id; // needed to fetch date and cover later
});


// ============================ CONVERTER METHODS ============================ //
// var getSuggestionByReleasegroup = function(err, releasegroup, callback){

// }


// ============================ FETCHING METHODS ============================ //
var getMusicSuggestionsBySearchterm = function(searchterm, callback){
	async.parallel({
		musicbrainz_result: function(callback){
			getSuggestionsFromMusicbrainz(searchterm, callback);
		}
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
			var renderResult = new Array();

			// async.each(resultset, function( suggestion, callback) {
			async.each(results.songtitle_result, function( suggestion, callback) {
				
				getDateByMusicBrainzSuggestion(suggestion, function(err, response){
					if(!err){
						suggestion.suggestedDate = response;
						console.log(suggestion);
						renderResult.push(suggestion);
						callback();
					} else {
						console.log('skipped');
						callback();
					}
				});

			}, function(err){
				// if any of the saves produced an error, err would equal that error
				if( err ) {
					callback(new Error('Something went wrong: "' + err + '".'), renderResult);
				} else {
					// console.log('All files have been processed successfully');
					// console.log(renderResult);
					callback(null, renderResult);
				}
			});
		}
	});
}

var setAdditionalInfo = function(suggestion, callback) {

	async.parallel({
		date: function(callback) {
			getDateByMusicBrainzSuggestion(suggestion, callback);
		},
		cover: function(callback) {
			getCoverArtByMusicBrainzSuggestion(suggestion, callback);
		}
	}, 
	function(err, results) {
		if(err){
			callback(new Error('MusicBrainz sent an error: "' + err + '".'), results);
		} else {
			callback(err, results);
		}
	});
}

var getDateByMusicBrainzSuggestion = function (suggestion, callback) {
	var mbid = suggestion.release_mbid;
	
	nb.release(mbid, function(err, response){
		if(err){
			callback(new Error('MusicBrainz did not find a date: "' + err + '".'), null);
		} else if(response.date !== undefined && response.date){
			var date = new Date();
			date = date.setFullYear(response.date.substr(0,4));
			callback(null, date);
		}
	});			
	
}

var getCoverArtByMusicBrainzSuggestion = function(suggestion, callback) {
	var mbid = suggestion.release_mbid;

	ca.release(mbid, function(err, response){
		if(!err && response && response.images[0].image !== undefined){
			callback(null, response.images[0].image);
		} else {
			callback(null, settings.design.defaultCover);
		}	
	});
}

var fetchReleasegroupsByArtist = function(err, searchterm, callback) {
	var limitResults = 5;
	var suggestionList = new Array();

	nb.search('release-group', {artist:searchterm, limit: limitResults}, function(err, result){
		if(err){
			callback(new Error('MusicBrainz sent an error: "' + err + '".'), searchterm);
		} else {

			if(result.count > 0) {

				for(var i = 0; i < result.count; i++) {

					if(result['release-groups'][i]){
						var suggestion = new Suggestion();
						suggestion.musicBrainzToSuggestion = result['release-groups'][i];

						suggestionList[i] = suggestion;
					}
				}
				callback(null, suggestionList);
			}
		}
	});
}

var fetchReleasegroupsBySongtitle = function(err, searchterm, callback) {
	var limitResults = 5;
	var suggestionList = new Array();


	nb.search('release-group', {releasegroup:searchterm, limit: limitResults}, function(err, result){
		if(err){
			callback(new Error('MusicBrainz sent an error: "' + err + '".'), searchterm);
		} else {
			if(result.count > 0) {

				for(var i = 0; i < result.count; i++) {

					if(result['release-groups'][i]){
						var suggestion = new Suggestion();
						suggestion.musicBrainzToSuggestion = result['release-groups'][i];

						suggestionList[i] = suggestion;
					}
				}
				callback(null, suggestionList);
			}
		}
	});
}

var Suggestion = mongoose.model('Suggestion', suggestionSchema); // local version
module.exports = mongoose.model('Suggestion', suggestionSchema); // for imports