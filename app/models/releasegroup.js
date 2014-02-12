var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	settings = require('../../config/ccsettings'),
	appname = settings.general.appname,
	appversion = settings.general.version,
	appurl = settings.general.url,
	CA = require('coverart');

// Initialize Cover Art
var ca = new CA({userAgent: appname + '/' + appversion + ' ( ' + appurl + ' )'});

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

releaseGroupSchema.virtual('setObjectFromNbResponse').set(function (nb_releasegroup) {

	this.title = nb_releasegroup.title;
	this.mbid = nb_releasegroup.id;
	this.type = nb_releasegroup['primary-type'];
	this.release_mbid = nb_releasegroup.releases[0].id;
	this.artist_name = nb_releasegroup['artist-credit'][0].artist.name;
	this.artist_mbid = nb_releasegroup['artist-credit'][0].artist.id;
	this.mb_url = 'http://musicbrainz.org/release/' + this.release_mbid;
	// this.getCoverArt(this.release_mbid);
	// console.log(nb_releasegroup);

});

releaseGroupSchema.methods.getCoverArt = function(mbid, callback) {
	console.log(mbid);
	ca.release(mbid, function(err, response){
		if(err){
			callback(new Error('Can not load cover. Error: "' + err + '".'));
		} else if(response){

			this.img_thumb_small = response.images[0].thumbnails.small;

			console.log(response.images[0].thumbnails.small);
			this.img_thumb_large = response.images[0].thumbnails.large;
			this.img_url = response.images[0].image;

			callback(null);
		} else {
			this.img_thumb_large = settings.design.defaultCover;
			this.img_thumb_small = settings.design.defaultCover;
			this.img_url = settings.design.defaultCover;
			callback(null);
		}
	});

}//('getCoverartByReleasegroupMbid').set(function (mbid, callback) {

	


		// TODO: auslagern

		// var mbid = releasegroup.release_mbid;

		// ca.release(mbid, function(err, response){
		// 	if(response){

		// 		releasegroup.img_thumb_small = response.images[0].thumbnails.small;
		// 		releasegroup.img_thumb_large = response.images[0].thumbnails.large;
		// 		releasegroup.img_url = response.images[0].image;

		// 		callback(null);
		// 	} else {
		// 		releasegroup.img_thumb_large = settings.design.defaultCover;
		// 		releasegroup.img_thumb_small = settings.design.defaultCover;
		// 		releasegroup.img_url = settings.design.defaultCover;
		// 		callback(null);
		// 	}
		// });


mongoose.model('ReleaseGroup', releaseGroupSchema);