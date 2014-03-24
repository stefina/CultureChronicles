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
			
			// console.log(element);

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

		
	$( ".fa-info-circle" ).click(function() {
		var i_id = $( this ).attr('id');
		var id = i_id.substring(2,i_id.length);
		var parentDiv = $('#result_' + id);
		if(parentDiv.hasClass('additionalInfoView')){
			parentDiv.addClass('imageView');
			parentDiv.removeClass('additionalInfoView');
		} else if(parentDiv.hasClass('imageView')){
			parentDiv.addClass('additionalInfoView');
			parentDiv.removeClass('imageView');
		}
	});

	$('#menu').click(function() {
		if($(this).hasClass('off')){
			$('#menu.off').addClass('on');
			$('#menu.off').removeClass('off');
		} else if ($(this).hasClass('on')){
			$('#menu.on').addClass('off');
			$('#menu.on').removeClass('on');
		}
	});

});

function customFormatResult(suggestion) {

	if(suggestion !== undefined){
		// console.log(suggestion);
		// console.log(suggestion.suggestedDate);
		// var someDate = suggestion.suggestedDate.substring(0,4);
		// console.log(someDate);

		var markup = "<table class='resultRow'><tr>";
		markup += "<td class='type-info'><div class='src-type'><img src='../img/ico/" + suggestion.source + ".ico'/></div>";
		// markup += "<div class='source'>" + suggestion.source + "</div>";
		markup += "</td>";
		if (suggestion.img_url !== undefined) {
			markup += "<td class=''><img height='60px' width='60px' src='" + suggestion.img_url + "'/></td>";
		}
		markup += "<td style=''><div class='resultline title'>" + suggestion.title + "</div>";
		// markup += "<div class='resultline artist'>" + suggestion.artist_name + "</div>";
		if (suggestion.suggestedDate !== undefined) {
			markup += "<div class='resultline year'>" + suggestion.year + "</div>";
		}
		markup += "</td></tr></table>";
		return markup;
	}
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
	// $('#searchinput').val(suggestion.year);
	// $('#suggestionItem').val(suggestion);
	// $('#searchForm').submit();

	$.ajax({
        url: '/search',
        cache: false,
        type: 'POST',
        data : {suggestion:suggestion}//,
        // success: function(json) {
        //     alert('all done');
        // }
    });

	// return suggestion.title;
}
