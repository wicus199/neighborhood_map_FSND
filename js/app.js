/**
* TODO: Where do you use observables?? Need to look into this
* TODO: Error handling
* TODO: Will need initializations and also KO observables
*/

/**
* What is subject to a changing state? :
* - New Foursquare markers after a default marker is clicked
* - DONE: Wikipedia info. At the moment, div is fetched with jQuery and cleared manually. This is not allowed
* - List and markers that respond to the search box. Marker is already passed into
*   observable array of list items. Can use this to update markers together with list
* - Content inside the info windows - Create contentString var that holds KO html template.
*    Good example in JS fiddle
**/


/**
* @description Function runs when Google maps api loads successfully
* @param None
* @returns None
*/
var mapSuccess = function() {

    /**
    * @description This is the viewModel of the app that binds the model and views
    * @param None
    * @returns None
    */
    var viewModel = function() {
        // Global map variable (drawMarkers and initMap need access)
        var map;
        var self = this;
        // Create an array that will store the list of markers
        this.markersList = ko.observableArray([]);
        this.tempMarkersList = [];

        // Observable for the wikipedia article
        this.wikiDiv = ko.observable(0);

        // Create an infowindow object to display third party info on the marker
        var infowindow = new google.maps.InfoWindow();

        // Function to delete the temporary foursquare markers
        this.deleteTempMarkers = function() {
            self.tempMarkersList.forEach(function(currentMarker) {
                currentMarker.setMap(null);
            });
            self.tempMarkersList = [];
        };

        /**
        * @description Draws the markers on the map from the model data
        * @param {array} markerData - Data for the markers stored in the model
        * @returns None
        */
        this.drawMarkers = function() {
            // Iterate through the model containing location info
            markers.forEach(function(currentMarker) {
                // Create a marker using the Google maps api
                var marker = new google.maps.Marker({
                    position: currentMarker.position,
                    map: map,
                    animation: google.maps.Animation.DROP,
                    title: currentMarker.name
                });
                // Add a listener to the marker using the Google api addListener method
                marker.addListener('click', function() {
                    // Call the selectMarker function and pass in the created Google marker
                    self.selectMarker(marker);
                });
                /*
                Add the created marker to the model of location data.
                This is to keep track of which marker is clicked, whether the
                marker is clicked directly or selected in the list.
                */
                // TODO: markersList is never used and does not contain new marker
                //      Should probably pass currentMarker to array
                currentMarker.marker = marker;
                // Add the marker to the list of markers array
                self.markersList.push(marker);
            });
        };

        /**
        * @description Initializes the Google Map on the page
        * @param None
        * @returns None
        */
        this.initMap = function() {
            // This initializes the Map at a certain location
            map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: -25.814474, lng: 28.244502},
                zoom: 13
            });
        };

        /**
        * @description Populates the InfoWindow and wiki div with 3rd party data
        * @param {object} marker - Marker object on which to open the infowindow
        * @returns None
        */
        this.populateWindows = function(marker) {
            // set the content on the marker
            self.getWikipediaInfo(marker);
            self.getFoursquareInfo(marker);
        };

        /**
        * @description Changes the active marker to the marker clicked on the map or in the list
        * @param {object} clickedItem - Object of clicked list item returned when clicked
        * @returns None
        */
        this.selectMarker = function(clickedItem) {
            // Change the center of the map to the coordinates of the selected marker
            map.panTo(clickedItem.position);
            // Give the marker an animation with a duration of 2 sec using Google maps api
            // If marker is still busy with animation when clicked again, stop animation
            if (clickedItem.getAnimation() !== null) {
                clickedItem.setAnimation(null);
            //  Give the marker a Bounce animation with a duration of 2 seconds
            } else {
                clickedItem.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                    clickedItem.setAnimation(null);
                }, 2000);
            }
            // Call the function to populate the infowindow with data
            self.populateWindows(clickedItem);
        };

        /**
        * @description Search wikipedia info on marker location.
        * @param {object} marker - Marker object
        * @returns
        */
        this.getWikipediaInfo = function(marker) {
            // TODO: If article can't be found of marker, tell user and search town article for town instead

            // Endpoint for wikipedia api
            this.wikiEndpoint = 'https://en.wikipedia.org/w/api.php';
            // Create url with paramenters to search wikipedia
            var wikiUrl = this.wikiEndpoint + '?' + $.param({
                'action': 'opensearch',
                'search': marker.title,
                'format': 'json'
            });

            // URL to search wikipedia articles. Used for link creation
            //var wikiSearch = 'http://en.wikipedia.org/wiki/';
            // Ajax request to retrieve wikipedia articles
            $.ajax({
                url: wikiUrl,
                dataType: 'jsonp',
                success: function(response) {
                    var genericResponse = ([
                        ["Generic Response"],
                        ["No Info"],
                        ["There exists no wikipedia page for this marker!"]
                    ]);

                    if (!response[1][0]) {
                        self.wikiDiv(genericResponse);
                    } else {
                        self.wikiDiv(response);
                    }
                }
            });
        };

        /**
        * @description Get Foursquare info on the selected marker
        * @param {object} marker - Marker object
        * @returns None
        */
        this.getFoursquareInfo = function(marker) {
            // Foursquare api endpoint to search a venue
            this.foursquareSearch = 'https://api.foursquare.com/v2/venues/search';
            // Foursquare api endpoint to explore recommended venues
            this.foursquareExplore = 'https://api.foursquare.com/v2/venues/explore';

            // Search the venue of the marker selected
            // Add the lat and lng parameters to the api endpoint to search location
            var searchUrl = this.foursquareSearch + '?' + $.param({
                'll' : marker.position.lat() + ',' + marker.position.lng(),
                'query': marker.title,
                'client_id': 'G0SN05EYUPGJZLV5VZ4KEP4W3RLXVHCUR3ZVMZYLLZAP1RHT',
                'client_secret': 'JIZ1ZUOUCHAHOH1EL0DPMFAV01UK3QFBSAO33GY0XRRUHTTL',
                'v': '20180112'
            });

            // TODO: Need a model for foursquare data instead of these variables

            // Ajax request works correctly. Can use response to populate infowindow
            $.getJSON(searchUrl, function(responseData) {
                //console.log(responseData);
                // TODO: This should be done with KO. Hidden div with changing values
                // TODO: Foursquare model to store response. Pass model into contentstring observable
                this.venueName = responseData.response.venues[0].name;
                this.venueContact = responseData.response.venues[0].contact.formattedPhone;

                this.categories = ( responseData.response.venues[0].categories[0] ?
                                    responseData.response.venues[0].categories[0].name :
                                    'No Category');

                this.location = responseData.response.venues[0].location.address;
                this.venueStats = responseData.response.venues[0].stats.checkinsCount;
                
                this.contentString = '<div><h4>' + this.venueName + '</h4>' +
                                    '<p>Contact details: ' + this.venueContact + '</p>' +
                                    '<p>Venue category: ' + this.categories + '</p>' +
                                    '<p>Venue Address: ' + this.location + '</p>' +
                                    '<p>Number of check-ins: ' + this.venueStats + '</p>' +
                                    '<button id="venuesButton" onclick="suggestMarkers(this)">Show suggested venues</button>' +
                                    '</div>';

                //this.contentString = ko.observable('<div id="infoWindow"></div>');

                infowindow.setContent(this.contentString);
                infowindow.open(map, marker);
            });

            // TODO: Populate map with temporary markers of recommended venues
            //      Create a new data model for the temp markers
            var exploreUrl = this.foursquareExplore + '?' + $.param({
                'll': marker.position.lat() + ',' + marker.position.lng(),
                'limit': '10',
                'client_id': 'G0SN05EYUPGJZLV5VZ4KEP4W3RLXVHCUR3ZVMZYLLZAP1RHT',
                'client_secret': 'JIZ1ZUOUCHAHOH1EL0DPMFAV01UK3QFBSAO33GY0XRRUHTTL',
                'v': '20180112'
            });


            // TODO: This should run in a seperate function
            $.getJSON(exploreUrl, function(responseData) {


                self.tempMarkersList.forEach(function(currentMarker) {
                    currentMarker.setMap(null);
                });
                self.tempMarkersList = [];

                responseData.response.groups[0].items.forEach(function(currentItem) {

                    var markerTemp = new google.maps.Marker({
                        position: {lat: currentItem.venue.location.lat, lng: currentItem.venue.location.lng},
                        map: map,
                        animation: google.maps.Animation.DROP,
                        title: currentItem.venue.name,
                        label: "FS"
                    });

                    markerTemp.addListener('click', function() {
                        // Call the selectMarker function and pass in the created Google marker
                        this.contentString = '<div><h4>' + currentItem.venue.name + '</h4>' +
                                            '<p>Contact details: ' + currentItem.venue.contact.formattedPhone + '</p>' +
                                            '<p>Venue category: ' + currentItem.venue.categories[0].name + '</p>' +
                                            '<p>Venue Address: ' + currentItem.venue.location.address + '</p>' +
                                            '</div>';

                        infowindow.setContent(this.contentString);
                        infowindow.open(map, markerTemp);
                    });

                    self.tempMarkersList.push(markerTemp);
                });

            });

        };

        // Initialize the google map on the page
        this.initMap();
        // Draw the default markers on the page
        this.drawMarkers();
    };

    ko.applyBindings(new viewModel());
};
