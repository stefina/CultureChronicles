var mongoose = require('mongoose'),
	Article = mongoose.model('Article'),
	Client = require('node-rest-client').Client,
	NB = require('nodebrainz');

// Initialize NodeBrainz
var nb = new NB({userAgent:'Culture Chronicles/0.0.1 ( http://my-awesome-app.com )'});;

client = new Client();


var	lastfm_api_key = '72e968612b23184d7c4e36f093a7ba46';
var	lastfm_secret = 'bb32f797d9a4dc1fce00d9742de7f9e6';
var lastfm_root_url = 'http://ws.audioscrobbler.com/2.0/';

var musicbrainz_root_url = 'http://musicbrainz.org';
var artist = 'tlc';
var track = 'unpretty';
var tlcMbid = '99790314-885a-4975-8614-9c5bc890364d';
var recordingMbid = '1970593f-d5e0-4bb9-9a25-985d44b1bc3e';
var releaseId = '2c036388-2df0-3b31-afde-818f695cc6eb';

// var requestURL= lastfm_root_url + '?method=track.getInfo&api_key=' + lastfm_api_key + '&artist=' + artist + '&track=' + track + '&format=json';
var requestURL= musicbrainz_root_url + '/ws/2/artist/?query=artist:TLC&fmt=json';



exports.index = function(req, res){
	Article.find(function(err, articles){
		if(err) throw new Error(err);
		res.render('home/search', {
			title: 'Generator-Express MVC',
			articles: articles
		});
	});
};

exports.getDate = function(req, res){
	var searchterm = req.query.searchinput;



	getMbidByArtist(null, searchterm, function(err, mbid){

		getArtistDateByMbid(err, mbid, function(lifespan){
			if(err) {
				console.error(err);
				res.status(404).render('404', { title: '404' });
			} else {
				res.render('home/search', {renderData: lifespan});
			}
		});
	});

};
//===========================================================================================

var retrieveSearchType = function(err, searchterm, callback) {

}

var getMbidByArtist = function(err, artistName, callback) {
	if(err){
		callback(new Error('Can not process "' +  artistName + '".'), artistName);
	} else {
		nb.search('artist', {artist:artistName}, function(err, artistObj){
			if(err){
				callback(new Error('MusicBrainz sent an error: "' + err + '".'), artistName);
			} else if(!artistObj.count >= 1) {
				callback(new Error('Artist ' + artistName + ' was not found. No mbid retrieved.'), artistName);
			} else {
				var mbid = artistObj.artist[0].id;
				callback(err, mbid);
			}
		});
	}
}

var getArtistDateByMbid = function(err, mbid, callback) {
	if(err) {
		callback(err, null);
	} else {
		nb.artist(mbid, function(err, artist){
			var lifeSpan = artist['life-span'];
			var start = lifeSpan['begin'];
			var end = lifeSpan['end'];
			callback({start: start, end: end});
		});
	}
}

function getReleaseDate(mbid, callback){

	nb.artist(mbid, {inc:'releases'}, function(err, response){
		var kram = response.releases;
		
		/*recursiveGetProperty(kram, 'release-events', function(obj) {
			console.log('===');// + JSON.stringify(obj));
			console.log(obj);
			// 2c036388-2df0-3b31-afde-818f695cc6eb
		});*/

		console.log(kram);

		callback(err, kram);
	});
}

function getRecordingDate(searchQuery, callback){
	nb.luceneSearch('artist',{query:searchQuery, limit: 10}, function(err, response){
		var recording;
		console.log(response);
	});
}

function getReleaseId(searchQuery, callback) {
	//'artist:' + artist + ' AND 
	nb.luceneSearch('release',{query:searchQuery, limit: 5}, function(err, response){
		var release = response.releases[0];
		console.log(response);
		// console.log(response.releases[0]);
		// console.log(release.id);
		recursiveGetProperty(release, 'release-group', function(obj) {
			console.log('****: ' + JSON.stringify(obj));
			console.log(obj.id);
			// 2c036388-2df0-3b31-afde-818f695cc6eb

			callback(err, obj.id);
		});
	});
}

function getRecordingId(artistName) {
	//'artist:' + artist + ' AND 
	nb.luceneSearch('recording',{query:artist + ' ' + track, limit: 5}, function(err, response){
		var recordingId = response.recording[0].id;
	});
}

function searchArtistByName(artistName) {
	var result;

	nb.search('artist', {artist: artistName, country:'US'}, function(err, response){
		console.log(response);
		result = response.artist[0];
	});
	return result;
}

// http://stackoverflow.com/a/6892047
function recursiveGetProperty(obj, lookup, callback) {
	for (property in obj) {
		if (property == lookup) {
			callback(obj[property]);
		} else if (obj[property] instanceof Object) {
			recursiveGetProperty(obj[property], lookup, callback);
		}
	}
} 