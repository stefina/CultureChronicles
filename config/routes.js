module.exports = function(app){

	//home route
	var home = require('../app/controllers/homeController');
	app.get('/', home.index);
	
	//search route
	var search = require('../app/controllers/searchController');
	app.get('/search', search.search);

	//search route
	var search = require('../app/controllers/searchController');
	app.post('/search', search.search);

	//search route
	var suggestionController = require('../app/controllers/suggestionController');
	app.get('/suggestions', suggestionController.getSuggestions);

};
