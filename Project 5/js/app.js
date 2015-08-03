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
var School = function(gsId, name, type, latitude, longitude, score, reviews) {
	this.schoolName = name;
	this.schoolType = type;
	this.schoolLatitude = latitude;
	this.schoolLongitude = longitude;
	this.schoolGsId = gsId;
	this.schoolScore = ko.observable(score);
	this.schoolReview = reviews;
};

/*
	The following is the class SchoolScore that has the list of all the school scores and the correlation with the Great School ID
*/
var SchoolScores = function(gsId, score) {
	this.schoolGsId = gsId;
	this.schoolScore = score;
};

/*
	The following is the class SchoolScore that has the list of all the school ratings and the correlation with the Great School ID
*/
var Reviews = function(gsId, rating, reviewUrl) {
	this.schoolGsId = gsId;
	this.rating = rating;
	this.reviewUrl = reviewUrl;
};

/* VIEWMODEL SECTION */
function appViewModel() {
	var self = this;
	var latitude, longitude, map, schools, searchType, defaultZipCode,
		mapMarkers, isInfoWindowVisible, shouldShowSearchSection, currentMarker,
		currentMarkerInitial,
		classifiedMapMarkers, isColorMarkerShown, isShowingAll, isMakingMarkers,
		toggleButtonName, currentSchoolIndex, schoolScores, schoolReviews,
		isGettingInfoFromApi;

	self.defaultZipCode = "95014";

	/* KO OBSERVABLE & OBSERVABLE ARRAY */
	//TODO: Allow the user to configure zipcode
	self.zipcode = ko.observable(self.defaultZipCode);

	//TODO: Allow the user to configure latitude and longitude
	self.latitude = ko.observable(37.318602);
	self.longitude = ko.observable(-122.046305);

	self.searchType = ko.observable(''); //The type of the school that is used for searching the map
	self.schools = ko.observableArray([]); //The schools in the specified neighborhood
	self.schoolScores = ko.observableArray([]); //The schools' score
	self.schoolReviews = ko.observableArray([]); //The schools' reviews
	self.mapMarkers = ko.observableArray([]); //The markers corresponding to the schools' location
	self.classifiedMapMarkers = ko.observableArray([]); //The color coded markers corresponding to the schools' location

	self.isInfoWindowVisible = ko.observable(false); //Tracks if info window is visible
	self.shouldShowSearchSection = ko.observable(true); //Tracks if the search section should be shown or not
	self.isColorMarkerShown = ko.observable(false); //Tracks if the color coded markers are shown
	self.isGettingInfoFromApi = ko.observable(true); //Tracks if the information is being loaded from the APIs
	self.isMakingMarkers = ko.observable(false); //Tracks if the making markers has commenced
	// self.isShowingAll = ko.observable(true); //Tracks if all the markers are shown

	self.currentMarker = ko.observable(); //Tracks the current clicked marker
	self.currentMarkerInitial = ko.observable(); //Tracks the current clicked marker's Initial

	self.toggleButtonName = ko.observable("Show Colored Markers"); //Toggles the button name

	self.currentSchoolIndex = ko.observable(); //Tracks the current clicked school's index

	//Compute the first initial of the school type
	self.schoolTypeInitial = ko.computed(function() {
		return ko.utils.arrayMap(self.schools(), function(item) {
			return item.schoolType.slice(0, 1);
		});
	});

	//Error handling if Google Maps fails to load
	self.mapTimeout = setTimeout(function() {
		alert(
			"Oops. We aren't too proud of this!!!! But we did hit an issue with Google maps. Please try again later :("
		);
	}, 8000);

	//Error handling if Great Schools fails to load
	self.greatSchoolsTimeout = setTimeout(function() {
		alert(
			"Oops. We aren't too proud of this!!!! But we did hit an issue with Great Schools. Please try again later :("
		);
	}, 8000);

	/* Data related actions */
	function getSchools(zipcode) {
		//Get the schools in the zipcode from GreatSchools.org
		var url =
			"http://api.greatschools.org/schools/nearby?key=[APIKEY]&state=CA&zip=95014",
			//Adding the yahoo proxy for making the call to the GreatSchools.org REST API
			yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(
				'select * from xml where url="' + url + '"') + '&format=xml&callback=?';

		$('#loading').html('<article><h2>Loading...</h2></article>');
		self.isGettingInfoFromApi(true);

		//The response is XML containing the school information including an unique GSID
		$.getJSON(yql, function(data, status, xhr) {
			var xml = data.results[0],
				schoolGsId,
				schoolName,
				schoolType,
				schoolLatitude,
				schoolLongitude,
				schoolGrade,
				type;

			if (xml.indexOf("error") === -1) {
				//Got a response from Great Schools
				clearTimeout(self.greatSchoolsTimeout);
				$('#loading').html(
					'<article><h2>Got the School info from GreatSchools.org</h2></article>'
				);
				self.isGettingInfoFromApi(true);
			}

			var counter = 0;

			$(xml).find('school').each(function() {
				//If the response contains the zip code, then store the school; Else ignore the school
				if ($(this).find('address').text().indexOf(self.zipcode()) > -1) {
					counter++;
					$('#loading').html('<article><h2>Found ' + counter +
						'schools in 95014</h2></article>');
					self.isGettingInfoFromApi(true);

					//Process the information from Great Schools
					schoolGsId = $(this).find('gsId').text();
					schoolName = $(this).find('name').text();
					type = $(this).find('type').text();
					schoolLatitude = $(this).find('lat').text();
					schoolLongitude = $(this).find('lon').text();
					schoolGrade = $(this).find('gradeRange').text();

					//Calculating the school type based on the procured type and grades associated with the school
					schoolType = getSchoolType(type, schoolGrade, schoolName);

					//Calling the function that will request the Great Schools REST API for the scores asynchronously
					getSchoolGreatSchoolsScore(schoolGsId);

					//Creating a school with the available data
					self.schools.push(new School(schoolGsId, schoolName, schoolType,
						schoolLatitude, schoolLongitude, '', ''));
				}
			});
		});
	}

	/* Get the type based on the Great Schools type and school grades */
	function getSchoolType(type, grade, name) {
		//If the type is private, then marking the school type as private
		if (type === 'private') {
			return "Private";
		} else if (type === 'public') { //If the type is public, then doing further classifications
			switch (grade) {
				case '9-12':
				case '7-12':
					return 'High';
				case 'K-5':
				case 'K-6':
				case 'PK-5':
					return 'Elementary';
				case '6-8':
				case '7-8':
					return 'Middle';
				case 'K-8':
					return 'K-8';
				default:
					return 'High';
			}
		}
	}

	//Error handling if Great Schools fails to load
	self.greatSchoolsScoresTimeout = setTimeout(function() {
		alert(
			"Oops. We aren't too proud of this!!!! But we did hit an issue with Great Schools. Please try again later :("
		);
	}, 8000);

	//For a given GSID, get the school scores from the GS REST API
	function getSchoolGreatSchoolsScore(gsId) {
		//Keep the user informed about the loading
		$('#loading').html('<article><h2>Loading Scores...</h2></article>');
		self.isGettingInfoFromApi(true); //Still loading

		var score,
			url = "http://api.greatschools.org/school/tests/CA/" + gsId +
			"?key=[APIKEY]",
			yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(
				'select * from xml where url="' + url + '"') + '&format=xml&callback=?';


		$.getJSON(yql, function(data, status, xhr) {
			var xml = data.results[0];

			if (xml.indexOf("error") === -1) {
				//Got a response from Great Schools
				clearTimeout(self.greatSchoolsScoresTimeout);
			}

			//Private schools dont have scores. Hence Great school doesnt define the score
			if ($(xml).find('score').first().text() === '') {
				score = 'No Scores Available (Private school)';
			} else {
				//Got a response from Great Schools
				clearTimeout(self.greatSchoolsTimeout);
				score = $(xml).find('score').first().text();
			}

			//Record the scores in the array schoolScores
			self.schoolScores.push(new SchoolScores(gsId, score));

			//If the number of schools, scores, reviews and the number of markers match, call makeMarkers
			if ((self.schools().length === self.schoolScores().length) && !self.isMakingMarkers()) {
				//Reorder the school scores array to match the schools array
				reorderArray(self.schoolScores(), self.schools());
				//Sending out request to get yelp reviews
				findSchoolReview(self.zipcode, self.schools());
			} else {
				//Keep the user informed about the loading percentage
				var percentComplete = Math.floor((self.schoolScores().length / self.schools()
					.length) * 100);
				$('#loading').html('<article><h2>Loading Scores - ' + percentComplete +
					'% complete</h2></article>');
				self.isGettingInfoFromApi(true); //Still loading
				self.isMakingMarkers(false); //Still not making markers
			}
		});
	}

	//Error handling if Yelp fails to load
	self.yelpTimeout = setTimeout(function() {
		alert(
			"Oops. We aren't too proud of this!!!! But we did hit an issue with Yelp. Please try again later :("
		);
	}, 8000);

	function findSchoolReview(zipCode, schoolArray) {
		for (var i = 0; i < schoolArray.length; i++) {
			yelpSearch('95014', schoolArray[i].schoolName, schoolArray[i].schoolGsId,
				'cb' + i);
		}
	}

	function yelpSearch(zipCode, schoolName, gsId, callback) {
		var auth = {
			consumerKey: "consumerKey",
			consumerSecret: "consumerSecret",
			accessToken: "accessToken",
			accessTokenSecret: "accessTokenSecret",
			serviceProvider: {
				signatureMethod: "HMAC-SHA1"
			}
		};

		var accessor = {
			consumerSecret: auth.consumerSecret,
			tokenSecret: auth.accessTokenSecret
		};

		var parameters = [];
		parameters.push(['term', schoolName]);
		parameters.push(['location', zipCode]);
		parameters.push(['callback', callback]);
		parameters.push(['oauth_consumer_key', auth.consumerKey]);
		parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
		parameters.push(['oauth_token', auth.accessToken]);
		parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

		var message = {
			'action': 'http://api.yelp.com/v2/search',
			'method': 'GET',
			'parameters': parameters
		};

		OAuth.setTimestampAndNonce(message);
		OAuth.SignatureMethod.sign(message, accessor);

		var parameterMap = OAuth.getParameterMap(message.parameters);

		yelpApiCall(message.action, parameterMap, schoolName, gsId, callback);
	}

	function yelpApiCall(url, yelpParameterMap, schoolName, gsId, callback) {
		$.ajax({
			'url': url,
			'data': yelpParameterMap,
			'dataType': 'jsonp',
			'global': true,
			'jsonpCallback': callback,
			'success': function(data) {
				clearTimeout(self.yelpTimeout);
				var rating = getSchoolReview(data, schoolName);
				var reviewUrl = getSchoolUrl(data, schoolName);
				self.schoolReviews.push(new Reviews(gsId, rating, reviewUrl));

				//If the number of schools, scores, reviews and the number of markers match, call makeMarkers
				if ((self.schools().length === self.schoolScores().length) && (self.schools()
						.length === self.schoolReviews().length) && !self.isMakingMarkers()) {
					self.isGettingInfoFromApi(false);
					reorderArray(self.schoolScores(), self.schools());
					reorderArray(self.schoolReviews(), self.schools());
					makeMarkers(self.schools());
				} else {
					//Keep the user informed about the loading percentage
					var percentComplete = Math.floor((self.schoolReviews().length / self.schools()
						.length) * 100);
					$('#loading').html('<article><h2>Loading Yelp Reviews - ' +
						percentComplete + '% complete</h2></article>');
					self.isGettingInfoFromApi(true); //Still loading
					self.isMakingMarkers(false); //Still not making markers
				}
			}
		});
	}

	function getSchoolReview(data, name) {
		var results = data.businesses;

		if (results.length > 0) {
			for (var index = 0; index < results.length; index++) {
				var school = results[index];

				if ((name === school.name) || (name.indexOf(school.name) > -1) || (school.name
						.indexOf(name) > -1)) {
					return school.rating + " stars based on " + school.review_count +
						" reviews";
				}
			}

			return 'No reviews found';
		} else {
			return 'No reviews found';
		}
	}

	function getSchoolUrl(data, name) {
		var results = data.businesses;

		if (results.length > 0) {
			for (var index = 0; index < results.length; index++) {
				var school = results[index];

				if ((name === school.name) || (name.indexOf(school.name) > -1) || (school.name
						.indexOf(name) > -1)) {
					return school.url;
				}
			}

			return 'http://www.yelp.com';
		} else {
			return 'http://www.yelp.com';
		}
	}

	function reorderArray(givenArray, schoolArray) {
		var length = givenArray.length,
			originalLength = schoolArray.length;
		for (var i = 0; i < originalLength; i++) {
			for (var j = i; j < length; j++) {
				if ((schoolArray[i].schoolGsId === givenArray[j].schoolGsId) && (i != j)) {
					var element = givenArray[j];
					givenArray.splice(j, 1);
					givenArray.splice(i, 0, element);
					break;
				}
			}
		}

		return givenArray;
	}

	/* Clear any filtering */
	//Show all the schools
	this.clearFilter = function() {
		self.searchType(''); //No search type
		$.each(self.schools(), function(index) {
			self.mapMarkers()[index].marker.setVisible(true); //Show all the markers
		});
	};

	/* Search and Filter actions */
	//If the schoolType matches the searchtype, then show the school, else hide the school
	//If there's no search text, show all the schools
	//Changing both the type of the object and the search string to be the same case
	this.filterSchoolsByType = function() {
		$.each(self.schools(), function(index) {
			if (self.searchType().length > 0) {
				if (self.schools()[index].schoolType.toLowerCase() === self.searchType()
					.toLowerCase()) {
					self.mapMarkers()[index].marker.setVisible(true);
				} else {
					self.mapMarkers()[index].marker.setVisible(false);
				}
			} else {
				self.mapMarkers()[index].marker.setVisible(true);
			}
		});
	};

	/* List View */
	//Get the index of the clicked school
	this.setCurrentSchoolIndex = function(clickedSchoolIndex) {
		self.currentSchoolIndex(clickedSchoolIndex()); //Set the index in the variable
		filterSchoolsByIndex(self.currentSchoolIndex()); //Trigger filtering
	};

	//Show only the clicked school
	function filterSchoolsByIndex(clickedSchoolIndex) {
		$.each(self.schools(), function(index) {
			self.mapMarkers()[index].marker.setVisible(false); //Hide all the markers
		});

		var currentMarker = self.mapMarkers()[clickedSchoolIndex].marker; //Get the marker of interest into a variable
		currentMarker.setVisible(true); //Show the marker of interest
		google.maps.event.trigger(currentMarker, 'click'); //Trigger clicked event to show infoWindow
		// self.isShowingAll(false); //Setting the isShowingAll to be false
	}

	/* Color Coding by School Type */
	//Show/Hide color coded markers
	this.toggleColorCodedMarkers = function() {
		//We want to show the color coded markers
		if (self.toggleButtonName() === "Show Colored Markers") {
			self.isColorMarkerShown(true); //Set isColorMarkerShown to be true
			self.toggleButtonName("Show Clickable Markers"); //Change the name of the button
			$.each(self.mapMarkers(), function(index) {
				self.mapMarkers()[index].marker.setVisible(false); //Hide the clickable markers
				self.classifiedMapMarkers()[index].marker.setVisible(true); //Show the colored markers
			});
		} else {
			self.isColorMarkerShown(false); //Set isColorMarkerShown to be false
			self.toggleButtonName("Show Colored Markers"); //Change the name of the button
			$.each(self.mapMarkers(), function(index) {
				self.mapMarkers()[index].marker.setVisible(true); //Show the clickable markers
				self.classifiedMapMarkers()[index].marker.setVisible(false); //Hide the colored markers
			});
		}
	};

	/* Map related actions */
	//Initialize the map
	function initialize() {
		map = new google.maps.Map(document.getElementById('googlemap-canvas'), {
			//Setting the zoom to be 13-just right to show a reasonable amount of the schools in the neighborhood
			zoom: 13,
			//centering around the latitude, longitude
			center: {
				lat: self.latitude(),
				lng: self.longitude()
			} //37.318602, -122.046305
		});

		//Clear the timeout ticker in case we did get back the information from Google
		clearTimeout(self.mapTimeout);

		//Get the list of schools
		getSchools(self.zipcode);
	}

	function getSchoolScore(currentSchoolIndex) {
		return self.schoolScores()[currentSchoolIndex];
	}

	function getSchoolYelpInfo(currentSchoolIndex) {
		return self.schoolReviews()[currentSchoolIndex];
	}

	function ratingLinkClick(currentSchoolYelpUrl) {
		document.querySelector(".reviewBrowser").setAttribute("src",
			currentSchoolYelpUrl);
		alert("click");
	}

	//Make Markers
	function makeMarkers(schoolArray) {
		self.isMakingMarkers(true);
		$.each(schoolArray, function(index) {
			/*
				Get the school at the current index
				Get the Google Geolocation of the school based on the latitude and longitude
				Set the ContentString for the InfoWindow of the marker
				*/

			var schoolsList = self.schools(),
				currentSchool = schoolsList[index],
				currentSchoolIndex = index,
				currentSchoolScore = getSchoolScore(currentSchoolIndex),
				currentSchoolYelpInfo = getSchoolYelpInfo(currentSchoolIndex),
				geoLocation = new google.maps.LatLng(currentSchool.schoolLatitude,
					currentSchool.schoolLongitude),
				contentString;

			if ((typeof currentSchoolYelpInfo.reviewUrl !== undefined) || (
					currentSchoolYelpInfo.reviewUrl != 'No reviews found') || (
					currentSchoolYelpInfo.reviewUrl != 'http://www.yelp.com')) {
				contentString = '<div id="infowindow">' +
					'<h2>' + currentSchool.schoolName + '</h2>' +
					'<p class="score">GreatSchool Score: ' + currentSchoolScore.schoolScore +
					'</p><p class="ratingLink">Yelp Rating: ' + currentSchoolYelpInfo.rating +
					'</p><p><a class="ratingLink" href="' + currentSchoolYelpInfo.reviewUrl +
					'">Yelp Review</a></p></div>';
			} else {
				contentString = '<div id="infowindow">' +
					'<h2>' + currentSchool.schoolName + '</h2>' +
					'<p class="score">GreatSchool Score: ' + currentSchoolScore.schoolScore +
					'</p><p class="rating">Yelp Rating: ' + currentSchoolYelpInfo.rating +
					'</p></div>';
			}

			//Create the marker and make it visible by default
			var marker = new google.maps.Marker({
				position: geoLocation,
				map: map,
				title: currentSchool.schoolName,
				visible: true
			});

			var iconImage;

			switch (currentSchool.schoolType) {
				case 'Elementary':
					iconImage = 'images/blue-dot.png';
					break;
				case 'Middle':
					iconImage = 'images/yellow-dot.png';
					break;
				case 'High':
					iconImage = 'images/green-dot.png';
					break;
				case 'Private':
					iconImage = 'images/purple-dot.png';
					break;
				case 'K-8':
					iconImage = 'images/red-dot.png';
					break;
			}

			var colorCodedMarker = new google.maps.Marker({
				position: geoLocation,
				map: map,
				title: currentSchool.schoolName,
				icon: iconImage,
				visible: false
			});

			//Set a label of the marker (The first initial of the school)
			marker.setLabel(self.schoolTypeInitial()[index]);

			//Create the info window of the marker
			var infowindow = new google.maps.InfoWindow({
				content: contentString
			});

			//Set the isInfoWindowVisible to be false upon info window close
			//Set the shouldShowSearchSection to be true
			google.maps.event.addListener(infowindow, 'closeclick', function() {
				self.isInfoWindowVisible(false); //Hide the info window
				self.shouldShowSearchSection(true); //Show the search section
				self.currentMarker().setAnimation(null); //Stop the animation of the marker
				self.currentMarker().setLabel(self.currentMarkerInitial()); //Reset the marker's label
				self.clearFilter();
			});

			//Set the map for the marker
			marker.setMap(map);
			colorCodedMarker.setMap(map);

			//Push the marker to the mapMarkers array
			self.mapMarkers.push({
				marker: marker,
				content: contentString,
				infowindow: infowindow
			});

			//Push the color coded marker to the classifiedMapMarkers array
			self.classifiedMapMarkers.push({
				marker: colorCodedMarker,
				type: currentSchool.schoolType
			});

			//Marker Click Action - Show the School Name and Scores
			google.maps.event.addListener(marker, 'click', function() {
				self.currentMarker(marker); //Set the current marker
				self.currentMarkerInitial(self.currentMarker().getLabel()); //Get the current marker's label
				self.currentMarker().setLabel(""); //Set the current marker's label to be nothing
				self.currentMarker().setAnimation(google.maps.Animation.BOUNCE); //Set animation of the marker
				infowindow.open(map, marker); //Open the infowindow
				self.isInfoWindowVisible(true); //Set the isInfoWindowVisible to be true - to open review section
				self.shouldShowSearchSection(false); //Set the shouldShowSearchSection to be false - to close search section
			});

			colorCodedMarker.setClickable(false); //color coded marker shouldn't be clickable
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

/* Keyboard */
ko.bindingHandlers.executeOnEnter = {
	init: function(element, valueAccessor, allBindings, viewModel) {
		var callback = valueAccessor();
		$(element).keypress(function(event) {
			var keyCode = (event.which ? event.which : event.keyCode);
			if (keyCode === 13) {
				callback.call(viewModel);
				return false;
			}
			return true;
		});
	}
};