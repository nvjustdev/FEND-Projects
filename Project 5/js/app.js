/* MODEL SECTION */

/*
The following is the class School that has the list of all the schools as retrieved from the data APIs
The class School has the following attributes:
Name of the school
Type of the school = "Elementary, Middle, High, Private, K8"
Latitude of the school
Longitude of the school
API score of the school
Yelp reviews for the school
*/
var School = function (name, type, latitude, longitude, score, review) {
	this.schoolName = name;
	this.schoolType = type;
	this.schoolLatitude = latitude;
	this.schoolLongitude = longitude;
	this.schoolScore = score;
	this.schoolReview = review;
};

/* VIEWMODEL SECTION */
function appViewModel() {
	var self = this;
	var latitude, longitude, map, schools, searchType, defaultZipCode,
		mapMarkers, isInfoWindowVisible, shouldShowSearchSection;

	self.defaultZipCode = "95014";

	/* KO OBSERVABLE & OBSERVABLE ARRAY */
	//TODO: Allow the user to configure zipcode
	self.zipcode = ko.observable(self.defaultZipCode);

	//TODO: Allow the user to configure latitude and longitude
	self.latitude = ko.observable(37.318602);
	self.longitude = ko.observable(-122.046305);

	self.searchType = ko.observable(''); //The type of the school that is used for searching the map
	self.schools = ko.observableArray([]); //The schools in the specified neighborhood
	self.mapMarkers = ko.observableArray([]); //The markers corresponding to the schools' location

	self.isInfoWindowVisible = ko.observable(false);
	self.shouldShowSearchSection = ko.observable(true);

	self.schoolTypeInitial = ko.computed(function() {
		return ko.utils.arrayMap(self.schools(), function(item) {
            return item.schoolType.slice(0, 1);
        });
	});

	//Error handling if Google Maps fails to load
	self.mapTimeout = setTimeout(function() {
		alert("Oops. We aren't too proud of this!!!! But we did hit an issue with Google maps. Please try again later :(");
	}, 8000);

	/* Data related actions */
	function getSchools(zipcode) {
		//TODO: Get the schools per zipcode from the data source
		//TODO: Remove test code
		self.schools.push(new School('William Faria Elementary School', 'Elementary', '37.320926', '-122.039626', '950', ''));
		self.schools.push(new School('Something Middle School', 'Middle', '37.310926', '-122.039626', '961', ''));
		self.schools.push(new School('Ever High School', 'High', '37.350926', '-122.039626', '962', ''));
		self.schools.push(new School('Private Private', 'Private', '37.300926', '-122.039626', '963', ''));

		makeMarkers(self.schools());
	}

	/* Search and Filter actions */
	//If the schoolType matches the searchtype, then show the school, else hide the school
	//If there's no search text, show all the schools
	//Changing both the type of the object and the search string to be the same case
	this.filterSchoolsByType = function() {
		console.log(self.searchType());
		$.each(self.schools(), function(index) {
			if (self.searchType().length > 0) {
				console.log(self.searchType())
				if (self.schools()[index].schoolType.toLowerCase() === self.searchType().toLowerCase()) {
					self.mapMarkers()[index].marker.setVisible(true);
				} else {
					self.mapMarkers()[index].marker.setVisible(false);
				}
			} else {
				self.mapMarkers()[index].marker.setVisible(true);
			}
		});
	};

	//Show all the schools
	this.clearFilter = function() {
		self.searchType('');
		$.each(self.schools(), function(index) {
			self.mapMarkers()[index].marker.setVisible(true);
		});
	};

	/* Map related actions */
	//Initialize the map
	function initialize() {
		map = new google.maps.Map(document.getElementById('googlemap-canvas'), {
			//Setting the zoom to be 14-just right to show a reasonable amount of the schools in the neighborhood
			zoom: 14,
			//centering around the latitude, longitude
			center: {lat: self.latitude(), lng: self.longitude()} //37.318602, -122.046305
		});

		//Clear the timeout ticker in case we did get back the information from Google
		clearTimeout(self.mapTimeout);

		//Get the list of schools
		getSchools(self.zipcode);
	}

	//Make Markers
	function makeMarkers(schoolArray) {
		$.each(schoolArray, function(index) {
			/*
				Get the school at the current index
				Get the Google Geolocation of the school based on the latitude and longitude
				Set the ContentString for the InfoWindow of the marker
			*/
			var currentSchool = self.schools()[index];
          		geoLocation = new google.maps.LatLng(currentSchool.schoolLatitude, currentSchool.schoolLongitude),
          		contentString = '<div id="infowindow">' +
      					'<h2>' + currentSchool.schoolName + '</h2>' +
      					'<p class="score">API Score: ' + currentSchool.schoolScore + '</p></div>';

      		//Create the marker and make it visible by default
	      	var marker = new google.maps.Marker({
	        	position: geoLocation,
	        	map: map,
	        	title: currentSchool.schoolName,
	        	visible: true
	      	});

	      	//Set a label of the marker (The first initial of the school)
	      	marker.setLabel(self.schoolTypeInitial()[index]);

	      	//Create the info window of the marker
	      	var infowindow = new google.maps.InfoWindow({
	      		content: contentString
	      	});

	      	//Set the isInfoWindowVisible to be false upon info window close
	      	//Set the shouldShowSearchSection to be true
	      	google.maps.event.addListener(infowindow,'closeclick',function(){
	      		self.isInfoWindowVisible(false);
	      		self.shouldShowSearchSection(true);
			});

	      	//Set the map for the marker
	      	marker.setMap(map);

	      	//Push the marker to the mapMarkers array
      		self.mapMarkers.push({marker: marker, content: contentString});

		    //Marker Click Action - Show the School Name and Scores
		    google.maps.event.addListener(marker, 'click', function() {
		    	//Open the infowindow
		        infowindow.open(map, marker);

		        //Set the isInfoWindowVisible to be true - to open review section
		        self.isInfoWindowVisible(true);

		        //Set the shouldShowSearchSection to be false - to close search section
		        self.shouldShowSearchSection(false);
		    });
		 });
	}

	//Fit the map to the window size
	window.addEventListener('resize', function(e) {
		var center = map.getCenter();
    	google.maps.event.trigger(map, "resize");
    	map.setCenter(center);
  	});

	//Show the map fullscreen on page load
	google.maps.event.addDomListener(window, 'load', initialize);

	/* Auto complete */
	self.searchOptions = ["Elementary", "Middle", "High", "Private", "K-8"];
}

ko.applyBindings(new appViewModel());

// ko.components.register('message-editor', {
//     viewModel: function(params) {
//         self.searchType = ko.observable(params);
//     },
//     template: ''
// });

/* Keyboard */
ko.bindingHandlers.executeOnEnter = {
    init: function (element, valueAccessor, allBindings, viewModel) {
        var callback = valueAccessor();
        $(element).keypress(function (event) {
            var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 13) {
                callback.call(viewModel);
                return false;
            }
            return true;
        });
    }
};


	// var geocoder = new google.maps.Geocoder();
		// geocoder.geocode({address: "95008"},
 //    function(results_array, status) {
 //        lat = results_array[0].geometry.location.lat();
 //        lng = results_array[0].geometry.location.lng();
 //        console.log("lat = " + lat + " long = " + lng);
	// });
	// var geocoder = new google.maps.Geocoder();
		// geocoder.geocode({address: "95008"},
 //    function(results_array, status) {
 //        lat = results_array[0].geometry.location.lat();
 //        lng = results_array[0].geometry.location.lng();
 //        console.log("lat = " + lat + " long = " + lng);
	// });