var mongoose = require('mongoose'),
	Article = mongoose.model('Article'),
	settings = require('../../config/ccsettings'),
	appname = settings.general.appname,
	appversion = settings.general.version,
	appurl = settings.general.url,
	Client = require('node-rest-client').Client,
	async = require('async'),
	NB = require('nodebrainz'),
	CA = require('coverart');

// Initialize Cover Art
var ca = new CA({userAgent: appname + '/' + appversion + ' ( ' + appurl + ' )'});

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

	getCoverArtByMbid(null, 'd1fc0c1b-9211-42b1-9ad1-1edd93bd86ff', function(err, result){
		console.log('--->' + result);
	});

	async.parallel({
		artists: function(callback){
			nb.search('artist', {artist:searchterm, limit:20}, function(err, result){
				callback(err, result);
			})
		},
		releases: function(callback){
			nb.search('release', {release:searchterm, limit:20}, function(err, result){
				callback(err, result);
			})
		},
		releasegroups: function(callback){
			nb.search('release-group', {artist:searchterm, limit:20}, function(err, result){
				callback(err, result);
			})
		},
		recordings: function(callback){
			nb.search('recording', {recording:searchterm, limit:20}, function(err, result){
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
				res.render('home/search', {soloArtists: renderData.soloArtists, releases: renderData.releases});
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


	var renderResult = new Object();

	// ARTISTS
	if(results.artists.count > 0){
		var soloArtists = new Object();
		for(var i = 0; i < results.artists.artist.length; i++) {
			var soloArtist = new Object();
			soloArtist.name = results.artists.artist[i].name;
			soloArtist.type = results.artists.artist[i].type;
			soloArtist.disambiguation = results.artists.artist[i].disambiguation;
			soloArtist.mbid = results.artists.artist[i].id;
			// soloArtist.lifespanbirth = results.artists.artist[i]['life-span'];
			soloArtist.begin = results.artists.artist[i]['life-span'].begin;
			soloArtist.end = results.artists.artist[i]['life-span'].end;
			soloArtists[i] = soloArtist;
		}

		// TODO: Handle ComboArtists
		renderResult.soloArtists = soloArtists;
	}

	if(results.releasegroups.count > 0) {
		var releasegroups = new Object();
		for(var i = 0; i < results.releasegroups['release-groups'].length; i++) {
			var releasegroup = new Object();
			releasegroup.title = results.releasegroups['release-groups'][0].title;
			releasegroup.id = results.releasegroups['release-groups'][0].id;
			releasegroup.type = results.releasegroups['release-groups'][0]['primary-type'];
			releasegroup.interpret = results.releasegroups['release-groups'][0]['artist-credit'][0].artist.name;

			// console.log(results.releasegroups['release-groups'][i]);
			console.log(releasegroup);
			console.log('###');
		}

	}

	if(results.releases.count > 0) {
		var releases = new Object();
		for(var i = 0; i < results.releases.releases.length; i++) {
			var release = new Object();
			release.name = results.releases.releases[i].title;
			release.interpret = results.releases.releases[i]['artist-credit'][0].artist.name;
			release.interpretid = results.releases.releases[i]['artist-credit'][0].artist.id;
			// release.disambiguation = results.releases.releases[i].disambiguation;
			release.date = results.releases.releases[i].date;
			release.mbid = results.releases.releases[i].id;
			releases[i] = release;
		}
		renderResult.releases = releases;
	}
	// console.log(renderResult);

	callback(err, renderResult);
}

var getCoverArtByMbid = function(err, mbid, callback) {
	if(err) {
		console.error(err);
		res.status(404).render('404', { title: '404' });
	} else {
		ca.release(mbid, function(err, response){
			console.log(response.images[0].image);
		});
		// ca.releaseGroup(mbid ,function(err, response){
		// 	if(err) {
		// 		console.error(err);
		// 		callback(err, response);
		// 	} else {
		// 		console.log(response.images[0].image);
		// 		//  {
		// 		//      "images": [
		// 		//          {
		// 		//              "types": [
		// 		//                  "Front"
		// 		//              ],
		// 		//              "front": true,
		// 		//              "back": false,
		// 		//              "edit": 22995833,
		// 		//              "image": "http://coverartarchive.org/release/472168df-be3a-44ee-b31d-393155f3366d/4686417696.jpg",
		// 		//              "comment": "",
		// 		//              "approved": true,
		// 		//              "thumbnails": {
		// 		//                  "large": "http://coverartarchive.org/release/472168df-be3a-44ee-b31d-393155f3366d/4686417696-500.jpg",
		// 		//                  "small": "http://coverartarchive.org/release/472168df-be3a-44ee-b31d-393155f3366d/4686417696-250.jpg"
		// 		//              },
		// 		//              "id": "4686417696"
		// 		//          }
		// 		//      ],
		// 		//      "release": "http://musicbrainz.org/release/472168df-be3a-44ee-b31d-393155f3366d"
		// 		//  }
		// 	}
		// });
	}
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