var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	settings = require('../../config/ccsettings'),
	appname = settings.general.appname,
	appversion = settings.general.version,
	appurl = settings.general.url;

var movieSchema = new Schema({
	title: String,
	mbid: String,
	type: String,
	release_mbid: String,
	img_url: String,
	img_thumb_small: String,
	img_thumb_large: String,
	artist_mbid: String,
	artist_name: String,
	mb_url: String
});

movieSchema.virtual('date')
	.get(function(){
		return this._id.getTimestamp();
	});


mongoose.model('Movie', movieSchema);