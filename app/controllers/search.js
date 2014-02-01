var mongoose = require('mongoose'),
	Article = mongoose.model('Article'),
	settings = require('../../config/ccsettings'),
	Client = require('node-rest-client').Client,
	async = require('async'),
	NB = require('nodebrainz');

// Initialize NodeBrainz
var nb = new NB({userAgent:'Culture Chronicles/0.0.1 ( http://my-awesome-app.com )'});;

client = new Client();

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


	async.parallel({
		artists: function(callback){
			nb.search('artist', {artist:searchterm}, function(err, result){
				callback(err, result);
			})
		},
		releases: function(callback){
			nb.search('release', {release:searchterm}, function(err, result){
				callback(err, result);
			})
		},
		recordings: function(callback){
			nb.search('recording', {recording:searchterm}, function(err, result){
				callback(err, result);
			})
		}
	},
	function(err, results) {
		if(err) {
			console.error(err);
			res.status(404).render('404', { title: '404' });
		} else {
			dealWithResult(err, results, function(err, renderData){
				console.log(renderData.soloArtists);
				res.render('home/search', {soloArtists: renderData.soloArtists});
			});
		}
	});


	// ===


	// getMbidByArtist(null, searchterm, function(err, mbid){

	// 	getArtistDateByMbid(err, mbid, function(lifespan){
	// 		if(err) {
	// 			console.error(err);
	// 			res.status(404).render('404', { title: '404' });
	// 		} else {
	// 			res.render('home/search', {renderData: lifespan});
	// 		}
	// 	});
	// });

};

//===========================================================================================
var dealWithResult = function(err, results, callback){


	var renderResult = new Object(),
		renderSoloArtists = new Object();

	// ARTISTS
	if(results.artists.count > 0){
		var soloArtists = new Object();
		for(var i = 0; i < results.artists.artist.length; i++) {
			var soloArtist = new Object();
			soloArtist.name = results.artists.artist[i].name;
			soloArtist.type = results.artists.artist[i].type;
			soloArtist.disambiguation = results.artists.artist[i].disambiguation;
			soloArtist.mbid = results.artists.artist[i].id;
			soloArtists[i] = soloArtist;
		}

		// TODO: Handle ComboArtists
		renderResult.soloArtists = soloArtists;
	}


	callback(err, renderResult);
}

var getMbidByQuery = function(err, searchterm, callback) {
	if(err){
		callback(err, searchterm);
	} else {
		
	}
}


var retrieveSearchType = function(err, searchterm, callback) {
	getMbidByArtist(null, searchterm, function(err, result){
		if(err){
			callback(err, searchterm);
		} else {
			console.log('artist: ' + result);
			calllback(err, result);
		}
	});
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