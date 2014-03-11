var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	settings = require('../../config/ccsettings'),
	appname = settings.general.appname,
	appversion = settings.general.version,
	appurl = settings.general.url;

var movieSchema = new Schema({
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

movieSchema.virtual('date')
	.get(function(){
		return this._id.getTimestamp();
	});


movieSchema.virtual('rottenToMovie').set(function (rottenResult) {
	this.mediaType = 'video';

	// var movie = new Movie();
	// movie.rottenToSuggestion = rottenResult




	
	// var date = new Date();
	// date.setFullYear(rottenResult.year);
	// this.date = date;
	// this.title = rottenResult.title;
	// this.img_url = rottenResult.posters.thumbnail;
	// this.id = this._id;
	// this.source = 'RottenTomatoes';

});

// {
//   "id": 12513,
//   "title": "Cabaret",
//   "year": 1972,
//   "genres": [
//     "Drama",
//     "Musical & Performing Arts",
//     "Classics"
//   ],
//   "mpaa_rating": "PG",
//   "runtime": 124,
//   "critics_consensus": "Great performances and evocative musical numbers help Cabaret secure its status as a stylish, socially conscious classic.",
//   "release_dates": {
//     "theater": "1972-02-13",
//     "dvd": "1998-04-28"
//   },
//   "ratings": {
//     "critics_rating": "Fresh",
//     "critics_score": 97,
//     "audience_rating": "Upright",
//     "audience_score": 88
//   },
//   "synopsis": "",
//   "posters": {
//     "thumbnail": "http://content9.flixster.com/movie/10/44/03/10440327_mob.jpg",
//     "profile": "http://content9.flixster.com/movie/10/44/03/10440327_pro.jpg",
//     "detailed": "http://content9.flixster.com/movie/10/44/03/10440327_det.jpg",
//     "original": "http://content9.flixster.com/movie/10/44/03/10440327_ori.jpg"
//   },
//   "abridged_cast": [
//     {
//       "name": "Liza Minnelli",
//       "id": "162665181",
//       "characters": ["Sally Bowles"]
//     },
//     {
//       "name": "Michael York",
//       "id": "162673938",
//       "characters": ["Brian Roberts"]
//     },
//     {
//       "name": "Joel Grey",
//       "id": "162668189",
//       "characters": ["Master of Ceremonies"]
//     },
//     {
//       "name": "Helmut Griem",
//       "id": "351325338",
//       "characters": ["Maximilian von Heune"]
//     },
//     {
//       "name": "Marisa Berenson",
//       "id": "162674227",
//       "characters": ["Natalia Landauer"]
//     }
//   ],
//   "abridged_directors": [
//     {"name": "Bob Fosse"},
//     {"name": "Sameh Abdel Aziz"}
//   ],
//   "studio": "Twentieth Century Fox Home Entertainment",
//   "alternate_ids": {"imdb": "0068327"},
//   "links": {
//     "self": "http://api.rottentomatoes.com/api/public/v1.0/movie_alias.json?type=imdb&id=0068327",
//     "alternate": "http://www.rottentomatoes.com/m/cabaret/",
//     "cast": "http://api.rottentomatoes.com/api/public/v1.0/movies/12513/cast.json",
//     "clips": "http://api.rottentomatoes.com/api/public/v1.0/movies/12513/clips.json",
//     "reviews": "http://api.rottentomatoes.com/api/public/v1.0/movies/12513/reviews.json",
//     "similar": "http://api.rottentomatoes.com/api/public/v1.0/movies/12513/similar.json",
//     "canonical": "http://api.rottentomatoes.com/api/public/v1.0/movies/12513.json"
//   },
//   "link_template": "http://api.rottentomatoes.com/api/public/v1.0/movie_alias.json?type=imdb&id={alias-id}"
// }


mongoose.model('Movie', movieSchema);