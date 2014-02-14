$( document ).ready(function() {
	$("#searchinput").select2({
		placeholder: "Search for a movie",
		minimumInputLength: 3,
		ajax: {
			url: "/search",
			dataType: 'json',
			quietMillis: 100,
			data: function (term, page) { // page is the one-based page number tracked by Select2
				return {
					q: term, //search term
					page_limit: 10, // page size
					page: page // page number
				};
			},
			results: function (data, page) {
				console.log(data);
				var more = (page * 10) < data.total; // whether or not there are more results available

				// notice we return the value of more so Select2 knows if more results can be loaded
				return {results: data.results, more: more};
			}
		} ,
		formatResult: movieFormatResult, // omitted for brevity, see the source of this page
		formatSelection: movieFormatSelection, // omitted for brevity, see the source of this page
		dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
		escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
	});

});

function movieFormatResult(movie) {

// img_url: "http://coverartarchive.org/release/62fd827a-f726-420b-8745-37e814159633/5544707845.jpg", img_thumb_large: "http://coverartarchive.org/release/62fd827a-f726-420b-8745-37e814159633/5544707845-500.jpg", img_thumb_small: "http://coverartarchive.org/release/62fd827a-f726-420b-8745-37e814159633/5544707845-250.jpg", mb_url: "http://musicbrainz.org/release/62fd827a-f726-420b-8745-37e814159633", artist_mbid: "2f569e60-0a1b-4fb9-95a4-3dc1525d1aad"…}
// _id: "52fe49a3bf2bdc6115000173"
// artist_mbid: "2f569e60-0a1b-4fb9-95a4-3dc1525d1aad"
// artist_name: "Backstreet Boys"
// img_thumb_large: "http://coverartarchive.org/release/62fd827a-f726-420b-8745-37e814159633/5544707845-500.jpg"
// img_thumb_small: "http://coverartarchive.org/release/62fd827a-f726-420b-8745-37e814159633/5544707845-250.jpg"
// img_url: "http://coverartarchive.org/release/62fd827a-f726-420b-8745-37e814159633/5544707845.jpg"
// mb_url: "http://musicbrainz.org/release/62fd827a-f726-420b-8745-37e814159633"
// mbid: "a763a6a1-1467-4444-b681-c9e62526167a"
// release_mbid: "62fd827a-f726-420b-8745-37e814159633"
// title: "The Essential Backstreet Boys"
// type: "Album"

	
	var markup = "<table class='resultRow'><tr>";
	if (movie.img_thumb_small !== undefined) {
		markup += "<td class=''><img height='60px' width='60px' src='" + movie.img_url + "'/></td>";
	}
	markup += "<td style=''><div class='resultline title'>" + movie.title + "</div>";
	markup += "<div class='resultline artist'>" + movie.artist_name + "</div>";
	if (movie.type !== undefined) {
		markup += "<div class='resultline type'>" + movie.type + "</div>";
	}
	// else if (movie.synopsis !== undefined) {
	// 	markup += "<div class='movie-synopsis'>" + movie.synopsis + "</div>";
	// }
	markup += "</td></tr></table>";
	return markup;
}

function movieFormatSelection(movie) {
	return movie.title;
}