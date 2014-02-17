$( document ).ready(function() {
	
	$("#searchinput").select2({
		placeholder: "Choose a timeframe!",
		minimumInputLength: 3,
		ajax: {
			url: "/suggestions",
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
				var more = (page * 10) < data.total; // whether or not there are more results available

				// notice we return the value of more so Select2 knows if more results can be loaded
				return {results: data.results, more: more};
			}
		},
		formatResult: customFormatResult, // omitted for brevity, see the source of this page
		formatSelection: formatSelection, // omitted for brevity, see the source of this page
		dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
		escapeMarkup: function (m) { return m; }, // we do not want to escape markup since we are displaying html in results
		selectOnBlur: true,
		initSelection: function(element, callback) {
			// the input tag has a value attribute preloaded that points to a preselected movie's id
			// this function resolves that id attribute to an object that select2 can render
			// using its formatResult renderer - that way the movie name is shown preselected
			
			console.log(element);

			// var id=$(element).val();
			// if (id!=="") {
			// 	$.ajax("http://api.rottentomatoes.com/api/public/v1.0/movies/"+id+".json", {
			// 		data: {
			// 			apikey: "ju6z9mjyajq2djue3gbvv26t"
			// 		},
			// 		dataType: "jsonp"
			// 	}).done(function(data) { callback(data); });
			// }
		}
	});

});

function customFormatResult(suggestion) {

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
	markup += "<td class='type-info'><div class='item-type'>" + suggestion.itemType + "</div>";
	// markup += "<div class='source'>" + suggestion.source + "</div>";
	markup += "</td>";
	if (suggestion.img_thumb_small !== undefined) {
		markup += "<td class=''><img height='60px' width='60px' src='" + suggestion.img_url + "'/></td>";
	}
	markup += "<td style=''><div class='resultline title'>" + suggestion.title + "</div>";
	markup += "<div class='resultline artist'>" + suggestion.artist_name + "</div>";
	if (suggestion.type !== undefined) {
		markup += "<div class='resultline type'>" + suggestion.type + "</div>";
	}
	markup += "</td></tr></table>";
	return markup;
}

// function formatResult(suggestion) {
// 	var markup = "<table class='movie-result'><tr>";
// 	if (movie.title !== undefined) {
// 		markup += "<td class='movie-image'><img src='" + suggestion.title + "'/></td>";
// 	}
// 	markup += "<td class='movie-info'><div class='movie-title'>" + suggestion.title + "</div>";
	
// 	markup += "</td></tr></table>";
// 	return markup;
// }

function formatSelection(suggestion) {
	$('#searchForm').submit();
	// return suggestion.title;
}