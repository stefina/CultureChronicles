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
var tomatoes = require('tomatoes');
var rottenTomatoes = tomatoes('hqwsh33vzge5zhnc6jzjwpsn');  // API Key

// ============================ Initialize APIS ============================ //
// Initialize Cover Art
var ca = new CA({userAgent: appname + '/' + appversion + ' ( ' + appurl + ' )'});
// Initialize NodeBrainz
var nb = new NB({userAgent:'Culture Chronicles/0.0.1 ( http://my-awesome-app.com )'});;

var resultItemSchema = new Schema({
	mediaType: {type: String, enum: ['audio', 'video', 'time', 'other']},
	suggestionType: {type: String, enum: ['movie', 'music', 'time', 'other']},
	suggestedDate: Date,
	title: String,
	img_url: String,
	id: String,
	source: String,
	release_mbid: String
});

resultItemSchema.virtual('date')
	.get(function(){
		return this._id.getTimestamp();
	});



// ============================ CONVERTER METHODS ============================ //


var ResultItem = mongoose.model('ResultItem', resultItemSchema); // local version
module.exports = mongoose.model('ResultItem', resultItemSchema); // for imports