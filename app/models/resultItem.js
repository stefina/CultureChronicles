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
var rottenTomatoes = tomatoes('hqwsh33vzge5zhnc6jzjwpsn');  // API Key
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
	release_mbid: String
});

// resultItemSchema.virtual('date')
// 	.get(function(){
// 		return this._id.getTimestamp();
// 	});


resultItemSchema.virtual('rottenToResultItem').set(function (rottenResult) {
	this.mediaType = 'video';
	this.mediaSubtype = 'movie';
	var suggestedDate = new Date();
	suggestedDate.setFullYear(rottenResult.year);
	this.date = suggestedDate;
	this.title = rottenResult.title;
	if(rottenResult && rottenResult.posters && rottenResult.posters.original){
		this.img_url = rottenResult.posters.original;
	}
	if(rottenResult && rottenResult.links && rottenResult.links.alternate){
		this.url = rottenResult.links.alternate;
	}
	
	this.id = this._id;
	this.source = 'RottenTomatoes';
});

resultItemSchema.statics.findByYear = function (searchterm, callback) {

	// fs.readFile(path.join(__dirname, '..', 'data/1972.html'), function (err, data) {
		// if (err) {
		// 	throw err; 
		// }
	request('http://www.imdb.com/search/title?release_date=' + searchterm + ',' + searchterm + '&title_type=feature', function(err, resp, body){
		// $ = cheerio.load(data.toString());

		$ = cheerio.load(body);


		var limiter = 5;
		var count = 0;
		var resultItemList = new Array();

		async.eachLimit($('table.results tr td span.wlb_wrapper'), 1, function( item, callback) {
			
			getImdbMovies(item, function(err, response){
				if(!err){
					resultItemList.push(response);
					callback();
				} else {
					console.log('skipped');
					callback();
				}
			});

		}, function(err, result){
			
			callback(null, resultItemList);
		});

	});

}

var getImdbMovies = function(elem, callback){

	var imdbId = $(elem).data().tconst;	
	var imdbId_trimmed = imdbId.substr(2, imdbId.length);

	client.get('http://api.rottentomatoes.com/api/public/v1.0/movie_alias.json?type=imdb&id=' + imdbId_trimmed + '&apikey=vz6vpwy4ngpkfhxqmcrmfz23&_prettyprint=true', function(data, response){
		// parsed response body as js object
		var result = JSON.parse(data);
		// console.log(result);
		// raw response
		var resultItem = new ResultItem();
		resultItem.rottenToResultItem = result;
		callback(null, resultItem);
	});


	

		// console.log($(elem).data().tconst);
	// });
}

// ============================ CONVERTER METHODS ============================ //


var ResultItem = mongoose.model('ResultItem', resultItemSchema); // local version
module.exports = mongoose.model('ResultItem', resultItemSchema); // for imports