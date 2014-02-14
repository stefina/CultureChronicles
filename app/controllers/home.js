var mongoose = require('mongoose'),
	Article = mongoose.model('Article'),
	settings = require('../../config/ccsettings'),
	appname = settings.general.appname;

exports.index = function(req, res){
	Article.find(function(err, articles){
		if(err) throw new Error(err);
		res.render('home/index', {
			title: appname,
			articles: articles
		});
	});
};