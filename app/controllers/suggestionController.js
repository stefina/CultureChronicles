var mongoose = require('mongoose'),
	Suggestion = require('../models/suggestion'),
	settings = require('../../config/ccsettings'),
	appname = settings.general.appname,
	appversion = settings.general.version,
	appurl = settings.general.url,
	userAgent = settings.general.user_agent,
	Client = require('node-rest-client').Client,
	async = require('async'),
	NB = require('nodebrainz'),
	CA = require('coverart');
// var IMDBConnector = require('./IMDBConnector');

// Initialize Cover Art
var ca = new CA({userAgent: appname + '/' + appversion + ' ( ' + appurl + ' )'});

// Initialize NodeBrainz
var nb = new NB({userAgent:userAgent});;

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

	Suggestion.findBySearchterm(searchterm, function (err, suggestions) {
		console.log('suggestions: ' + suggestions);
		res.json({ results: suggestions, page: 0 });
	});
	
 
	// fetchReleasegroupsBySearchterm(null, searchterm, function(err, result){
 //  		res.json({ results: result, page: 0 });
	// });

};



//===========================================================================================

