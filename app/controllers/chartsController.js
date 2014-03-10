var cheerio = require('cheerio');
var request = require('request'),
	mongoose = require('mongoose'),
	Movie = mongoose.model('Movie'),
	Client = require('node-rest-client').Client,
	imdb = require('imdb-api');

var trailerAddictAPI = 'http://api.traileraddict.com/?imdb=1403865&count=4&width=680';
var client = new Client();

// Wikipedia-20140213161431.xml


var fs = require('fs');
fs.readFile( __dirname + '/1984.html', function (err, data) {
	if (err) {
		throw err; 
	}

	$ = cheerio.load(data.toString());
	// $('table.results').children().each(function(i, elem) {
	// 	console.log('---');
	// 	console.log(elem('a'));
	// });
	$('table.results tr td span.wlb_wrapper').each(function(i, elem){
		var imdbId = $(elem).data().tconst;
		// imdb.getReq({ id: imdbId }, function(err, things) {
		// 	console.log(things);
		// 	console.log('----');
		// });
		var imdbId_trimmed = imdbId.substr(2, imdbId.length);

		// console.log($(elem).data().tconst);
	});

	client.get('http://api.traileraddict.com/?imdb=' + /*imdbId_trimmed*/'1403865' +  '&count=1&width=680', function(data, response){

		var kram = cheerio.load(data);

		// parsed response body as js object
		// console.log(data);
		console.log(kram('trailers').data());
		// raw response
		// console.log(response);
	});

});



var baseURI = 'http://rateyourmusic.com/charts/top/album/';



 
// request({
// 	// uri: 'http://rateyourmusic.com/charts/top/album/1972',
// 	uri: 'http://www.imdb.com/search/title?release_date=2011,2011&title_type=feature,tv_movie,tv_special,short',
// }, function(error, response, body) {
// 	// console.log(body);

// 	var $ = cheerio.load(body);
// 	var list = $('table');
	 
// 	console.log(list.html());
// });

exports.fetchChartlistByYear = function(year, callback) {
	console.log('fetching ' + year);
}