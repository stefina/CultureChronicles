var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	settings = require('../../config/ccsettings'),
	appname = settings.general.appname,
	appversion = settings.general.version,
	appurl = settings.general.url,
	resultLimit = settings.searchSettings.resultLimit;
	async = require('async'),
	NB = require('nodebrainz'),
	imdb = require('imdb-api'),
	CA = require('coverart');
var path = require('path');
var tomatoes = require('tomatoes');
var rottenTomatoes = tomatoes('smwvgx3y7t6x7h9c6zrbrarg');  // API Key
var request = require('request'),
	cheerio = require('cheerio');
var fs = require('fs');

// ============================ Initialize APIS ============================ //
// Initialize Cover Art
var ca = new CA({userAgent: appname + '/' + appversion + ' ( ' + appurl + ' )'});
// Initialize NodeBrainz
var nb = new NB({userAgent:'Culture Chronicles/0.0.1 ( http://my-awesome-app.com )'});;

var resultItemSchema = new Schema({
	mediaType: {type: String, enum: ['audio', 'video', 'text', 'other']},
	mediaSubtype: {type: String, enum: ['movie', 'music', 'time', 'other']},
	date: Date,
	title: String,
	img_url: String,
	id: String,
	source: String,
	url: String,
	year: String,
	release_mbid: String
});


resultItemSchema.virtual('rottenToResultItem').set(function (rottenResult) {
	this.mediaType = 'video';
	this.mediaSubtype = 'movie';
	var suggestedDate = new Date();
	this.date = rottenResult.year;
	suggestedDate.setFullYear(rottenResult.year);
	this.date = suggestedDate;
	this.title = rottenResult.title;
	if(rottenResult && rottenResult.posters && rottenResult.posters.original){
		this.img_url = rottenResult.posters.original;
	}
	// if(rottenResult && rottenResult.links && rottenResult.links.alternate){
		this.url = rottenResult.links.alternate;
	// }
	
	this.id = this._id;
	this.source = 'RottenTomatoes';
});

resultItemSchema.virtual('musicBrainzToResultItem').set(function (musicBrainzResult) {
	this.mediaType = 'audio';
	this.mediaSubtype = 'music';
	var suggestedDate = new Date();
	this.date = musicBrainzResult.year;
	suggestedDate.setFullYear(musicBrainzResult.year);
	this.date = suggestedDate;
	this.title = musicBrainzResult.title;
	if(musicBrainzResult && musicBrainzResult.posters && musicBrainzResult.posters.original){
		this.img_url = musicBrainzResult.posters.original;
	}
	// if(rottenResult && rottenResult.links && rottenResult.links.alternate){
		this.url = musicBrainzResult.links.alternate;
	// }
	
	this.id = this._id;
	this.source = 'MusicBrainz';
});



resultItemSchema.statics.findByYear = function (searchterm, callback) {

	request('http://www.imdb.com/search/title?release_date=' + searchterm + ',' + searchterm + '&title_type=feature', function(err, resp, body){

		$ = cheerio.load(body);

		var resultItemList = new Array();
		var itemList = new Array();

		async.eachLimit($('table.results tr td span.wlb_wrapper'), 1, function( item, callback) {
			
			getImdbMovies(item, function(err, response){
				if(!err){
					resultItemList.push(response);
					var imdbId = $(item).data().tconst;
					itemList.push(imdbId.substr(2, imdbId.length));
					callback();
				} else {
					console.log(err);
					callback();
				}
			});

		}, function(err, result){
			var trailerList = new Array();

			async.each(itemList, function(id, callback){
				client.get('http://api.traileraddict.com/?imdb='  + id +  '&count=1&width=680', function(data, response){

					var kram = cheerio.load(data);

					var videoCode = kram('trailer').html() + '';

					if(videoCode){
						var res = videoCode.split('src="');

						if(res[1]){

							var res2 = res[1].split('"');
							var url = res2[0];
							trailerList.push(url);
						}
					}

					callback();
				});

			}, function(err, result){
				callback(null, resultItemList, trailerList);
			});


		});

	});

}

// TODO: scrape music charts from www.bobborst.com
resultItemSchema.statics.findMusicByYear = function (searchterm, callback) {
	request('http://www.bobborst.com/popculture/top-100-songs-of-the-year/?year=' + searchterm, function(err, resp, body){

		$ = cheerio.load(body);

		var resultItemList = new Array();
		var itemList = new Array();

		async.eachLimit($('table.songtable tbody tr'), 1, function( item, callback) {
			
			var artist = $(item).children(1).text();
			var song = $(item).children(2).text(); 
			console.log($(item).children(2).text());

			fetchReleasegroupsBySongtitle(null, song, function(err, result){
				console.log(result);

			});

		}, function(err, result){
			var trailerList = new Array();

			async.each(itemList, function(id, callback){
				client.get('http://api.traileraddict.com/?imdb='  + id +  '&count=1&width=680', function(data, response){

					var trailerAddictCode = cheerio.load(data);

					var videoCode = trailerAddictCode('trailer').html() + '';
					// console.log(videoCode);

					if(videoCode){
						var res = videoCode.split('src="');

						if(res[1]){

							var res2 = res[1].split('"');
							var url = res2[0];
							trailerList.push(url);
						}
					}

					callback();
				});

			}, function(err, result){
				callback(null, resultItemList, trailerList);
			});


		});

	});
}

var fetchReleasegroupsBySongtitle = function(err, searchterm, callback) {
	var limitResults = 1;
	var suggestionList = new Array();


	nb.search('release-group', {releasegroup:searchterm, limit: limitResults}, function(err, result){
		if(err){
			callback(new Error('MusicBrainz sent an error: "' + err + '".'), searchterm);
		} else {
			if(result.count > 0) {

				for(var i = 0; i < result.count; i++) {

					if(result['release-groups'][i]){
						var resultItem = new ResultItem();
						console.log(result['release-groups'][i]);
						resultItem.musicBrainzToResultItem = result;
						callback(null, resultItem);
					} else {
						callback(result.error, null);
					}
				}
				callback(null, suggestionList);
			}
		}
	});
}


var getImdbMovies = function(elem, callback){

	var imdbId = $(elem).data().tconst;	
	var imdbId_trimmed = imdbId.substr(2, imdbId.length);

	client.get('http://api.rottentomatoes.com/api/public/v1.0/movie_alias.json?type=imdb&id=' + imdbId_trimmed + '&apikey=vz6vpwy4ngpkfhxqmcrmfz23&_prettyprint=true', function(data, response){
		// parsed response body as js object
		var result = JSON.parse(data);
		if(!result.error){
			// raw response
			var resultItem = new ResultItem();
			resultItem.rottenToResultItem = result;
			callback(null, resultItem);
		} else {
			callback(result.error, null);
		}

	});

}

// ============================ CONVERTER METHODS ============================ //


var ResultItem = mongoose.model('ResultItem', resultItemSchema); // local version
module.exports = mongoose.model('ResultItem', resultItemSchema); // for imports