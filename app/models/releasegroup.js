var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var releaseGroupSchema = new Schema({
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

releaseGroupSchema.virtual('date')
	.get(function(){
		return this._id.getTimestamp();
	});

releaseGroupSchema.virtual('nb_releasegroup').set(function (nb_releasegroup) {

	this.title = nb_releasegroup.title;
	this.mbid = nb_releasegroup.id;
	this.type = nb_releasegroup['primary-type'];
	this.release_mbid = nb_releasegroup.releases[0].id;
	this.artist_name = nb_releasegroup['artist-credit'][0].artist.name;
	this.artist_mbid = nb_releasegroup['artist-credit'][0].artist.id;
	this.mb_url = 'http://musicbrainz.org/release/' + this.release_mbid;
	// console.log(nb_releasegroup);

});

mongoose.model('ReleaseGroup', releaseGroupSchema);