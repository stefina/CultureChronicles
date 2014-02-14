var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var ArtistSchema = new Schema({
	title: String,
	mbid: String,
	img_url: String,
	artist_mbid: Number,
	artist_name: Number
});

ArtistSchema.virtual('date')
	.get(function(){
		return this._id.getTimestamp();
	});

mongoose.model('Artist', ArtistSchema);
