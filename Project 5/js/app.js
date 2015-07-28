function appViewModel() {
	var self = this;
	var map;

	//Error handling if Google Maps fails to load
	this.mapTimeout = setTimeout(function() {
		$('#googlemap-canvas').html("Oops. We aren't too proud of this. But we did hit an issue with Google maps");
		alert("Oops. We aren't too proud of this. But we did hit an issue with Google maps");
	}, 8000);

	function initialize() {
		map = new google.maps.Map(document.getElementById('googlemap-canvas'), {
			zoom: 14,
			center: {lat: 37.318602, lng: -122.046305} //37.318602, -122.046305
		});

		clearTimeout(self.mapTimeout);
	}

	// initialize();
	google.maps.event.addDomListener(window, 'load', initialize);
}

ko.applyBindings(new appViewModel());
