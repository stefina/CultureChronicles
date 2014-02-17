var mongoose = require('mongoose'),
	Suggestion = mongoose.model('Suggestion'),
	settings = require('../../config/ccsettings'),
	appname = settings.general.appname,
	appversion = settings.general.version,
	appurl = settings.general.url,
	Client = require('node-rest-client').Client,
	async = require('async'),
	NB = require('nodebrainz'),
	CA = require('coverart');
// var IMDBConnector = require('./IMDBConnector');

// Initialize Cover Art
var ca = new CA({userAgent: appname + '/' + appversion + ' ( ' + appurl + ' )'});

// Initialize NodeBrainz
var nb = new NB({userAgent:'Culture Chronicles/0.0.1 ( http://my-awesome-app.com )'});;

client = new Client();

exports.index = function(req, res){
	Article.find(function(err, articles){
		if(err) throw new Error(err);
		res.render('home/search', {
			title: appname,
			articles: articles
		});
	});
};

exports.getSuggestions = function(req, res){
	var searchterm = req.query.q;

	// get movie suggestions
	// get date suggestions
	// get music suggestions
	// get timeframe suggestions

	// wrap in a resultset

	Suggestion.findBySearchterm(searchterm, function (err, suggestions) {
		console.log(suggestions);
	});
	
 
	// fetchReleasegroupsBySearchterm(null, searchterm, function(err, result){
 //  		res.json({ results: result, page: 0 });
	// });

};



//===========================================================================================

var getCoverArtByReleaseGroup = function(releasegroup, callback) {
	var mbid = releasegroup.release_mbid;

	ca.release(mbid, function(err, response){
		if(response){
			releasegroup.img_thumb_small = response.images[0].thumbnails.small;
			releasegroup.img_thumb_large = response.images[0].thumbnails.large;
			releasegroup.img_url = response.images[0].image;
			callback(null);
		} else {
			releasegroup.img_thumb_large = settings.design.defaultCover;
			releasegroup.img_thumb_small = settings.design.defaultCover;
			releasegroup.img_url = settings.design.defaultCover;
			callback(null);
		}	
	});
}

var getCoverArtByMbid = function(err, mbid, callback) {
	if(err) {
		console.error(err);
		res.status(404).render('404', { title: '404' });
	} else {
		ca.release(mbid, function(err, response){
			if(response){
				callback(null, response.images[0].image);
			} else {
				callback(null, 'undefined');
			}
		});
	}
}

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