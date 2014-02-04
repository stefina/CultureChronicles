var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var ReleaseGroupSchema = new Schema({
	title: String,
	mbid: String,
	type: String,
	release_mbid: String,
	img_url: String,
	artist_mbid: String,
	artist_name: String
});

ReleaseGroupSchema.virtual('date')
	.get(function(){
		return this._id.getTimestamp();
	});

mongoose.model('ReleaseGroup', ReleaseGroupSchema);