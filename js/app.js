/**
* TODO: Error handling
* TODO: Initial marker for foursquare, otherwise template gives error
* TODO: Display foursquare markers in own list that also works with filter


* TODO: Disable wiki search for suggested venues. Close menu and infoWindow when buttons clicked
*/

/**
* What is subject to a changing state? :
* - New Foursquare markers after a default marker is clicked
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
        // Array to store temporary foursquare markers
        this.tempMarkersList = [];
        // Observable to hold foursquare response
        this.fsInstance = ko.observable(0);
        // Observable for the wikipedia article
        this.wikiDiv = ko.observable(0);

        // Create an infowindow object to display third party info on the marker
        this.infowindow = new google.maps.InfoWindow();
        this.selectedMarker = ko.observable(0);
        this.searchQuery = ko.observable('');

        // Function to delete the temporary foursquare markers
        this.deleteTempMarkers = function() {
            self.tempMarkersList.forEach(function(currentMarker) {
                currentMarker.setMap(null);
            });
            self.tempMarkersList = [];
            if ($(window).width() <= 1051) {
                self.closeSideNav();
            }
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

                /*
                Add the created marker to the model of location data.
                This is to keep track of which marker is clicked, whether the
                marker is clicked directly or selected in the list.
                */
                currentMarker.marker = marker;
                // Add the marker to the list of markers array
                self.markersList.push(currentMarker);

                // Add a listener to the marker using the Google api addListener method
                marker.addListener('click', function() {
                    // Call the selectMarker function and pass in the created Google marker
                    self.selectMarker(currentMarker);
                });


            });
            self.selectedMarker(self.markersList()[0].marker);
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
                zoom: 13,
                styles: mapStyles
            });
        };

        /**
        * @description
        * @param None
        * @returns None
        */
        this.initInfowindow = function() {
            // Boolean to determine if infowindow was loaded before
            // If infowindow was not loaded before, apply knockout binding
            var windowLoaded = false;
            this.contentString = '<div id="infoWindow"' +
                                'data-bind="template: {name: \'fs-template\', data: fsInstance}">' +
                                '</div>';

            self.infowindow.setContent(this.contentString);

            google.maps.event.addListener(self.infowindow, 'domready', function() {

                // This will only execute once
                if (!windowLoaded) {
                        windowLoaded = true;
                        // Why index 0? TODO: Test this
                        ko.applyBindings(self, $('#infoWindow')[0]);
                }
            });

        };

        /**
        * @description Populates the InfoWindow and wiki div with 3rd party data
        * @param {object} marker - Marker object on which to open the infowindow
        * @returns None
        */
        this.populateWindows = function(marker, enableWiki) {
            // set the content on the marker
            self.getWikipediaInfo(marker, enableWiki);
            self.getFoursquareInfo(marker);
        };

        /**
        * @description Changes the active marker to the marker clicked on the map or in the list
        * @param {object} clickedItem - Object of clicked list item returned when clicked
        * @returns None
        */
        this.selectMarker = function(clickedItem) {
            // This ensures that if either a marker or a location object with a marker property
            // is passed into the function, the marker will be handled correctly.
            var clickedMarker = clickedItem.marker ? clickedItem.marker : clickedItem;
            // True if original marker and false if suggested marker. This boolean value
            // will be used to enable wikipedia search for original locations and disable
            // it for suggested foursquare locations. This prevents random info from appearing
            var getWiki = clickedItem.marker ? true : false;

            // Change the center of the map to the coordinates of the selected marker
            self.selectedMarker(clickedMarker);
            map.panTo(clickedMarker.position);
            // Give the marker an animation with a duration of 2 sec using Google maps api
            // If marker is still busy with animation when clicked again, stop animation
            if (clickedMarker.getAnimation() !== null) {
                clickedMarker.setAnimation(null);
            //  Give the marker a Bounce animation with a duration of 2 seconds
            } else {
                clickedMarker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                    clickedMarker.setAnimation(null);
                }, 2000);
            }
            // Call the function to populate the infowindow with data
            self.infowindow.open(map, clickedMarker);
            self.populateWindows(clickedMarker, getWiki);
            if ($(window).width() <= 1051) {
                self.closeSideNav();
            }
        };

        /**
        * @description Search wikipedia info on marker location.
        * @param {object} marker - Marker object
        * @returns
        */
        this.getWikipediaInfo = function(marker, getWiki) {

            // Endpoint for wikipedia api
            this.wikiEndpoint = 'https://en.wikipedia.org/w/api.php';
            // Create url with paramenters to search wikipedia
            var wikiUrl = this.wikiEndpoint + '?' + $.param({
                'action': 'opensearch',
                'search': getWiki ? marker.title : 'Pretoria',  //'search': marker.title,
                'format': 'json'
            });

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


            // Search the venue of the marker selected
            // Add the lat and lng parameters to the api endpoint to search location
            // TODO: Move this to a separate function/model for separation of concerns
            var searchUrl = this.foursquareSearch + '?' + $.param({
                'll' : marker.position.lat() + ',' + marker.position.lng(),
                'query': marker.title,
                'client_id': 'G0SN05EYUPGJZLV5VZ4KEP4W3RLXVHCUR3ZVMZYLLZAP1RHT',
                'client_secret': 'JIZ1ZUOUCHAHOH1EL0DPMFAV01UK3QFBSAO33GY0XRRUHTTL',
                'v': '20180112'
            });

            // Ajax request works correctly. Can use response to populate infowindow
            $.getJSON(searchUrl, function(responseData) {
                self.fsInstance(new foursquareModel(responseData));

            });

        };

        this.createFoursquareMarkers = function(marker) {

            this.foursquareExplore = 'https://api.foursquare.com/v2/venues/explore';

            var exploreUrl = this.foursquareExplore + '?' + $.param({
                'll': marker.position.lat() + ',' + marker.position.lng(),
                'limit': '10',
                'client_id': 'G0SN05EYUPGJZLV5VZ4KEP4W3RLXVHCUR3ZVMZYLLZAP1RHT',
                'client_secret': 'JIZ1ZUOUCHAHOH1EL0DPMFAV01UK3QFBSAO33GY0XRRUHTTL',
                'v': '20180112'
            });



            // Ajax request to fetch foursquare info
            $.getJSON(exploreUrl, function(responseData) {

                self.tempMarkersList.forEach(function(currentMarker) {
                    currentMarker.setMap(null);
                });
                self.tempMarkersList = [];

                responseData.response.groups[0].items.forEach(function(currentItem,index) {

                    var fsMarker = new google.maps.Marker({
                        position: {lat: currentItem.venue.location.lat, lng: currentItem.venue.location.lng},
                        map: map,
                        animation: google.maps.Animation.DROP,
                        title: currentItem.venue.name,
                        icon: {
                            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                            scale: 5
                        }
                    });

                    self.tempMarkersList.push(fsMarker);

                    fsMarker.addListener('click', function() {
                        self.selectMarker(fsMarker);
                    });
                });
                self.infowindow.close();
                if ($(window).width() <= 1051) {
                    self.closeSideNav();
                }
            });
        };


        // Computed observable that uses observable arry created at the start
        // Take query string to lower case in order to always match characters
        this.result = ko.computed(function() {
            // Returns the result if it is true
            return self.markersList().filter(function(currentVal) {
                // Will return true if the letters are present in the correct sequence in location
                if (currentVal.name.toLowerCase().indexOf(self.searchQuery().toLowerCase()) >= 0) {
                    currentVal.marker.setMap(map);
                    return true;
                } else {
                    currentVal.marker.setMap(null);
                    return false;
                }
            });
        });

        this.openSideNav = function() {
            $('#sidebar')[0].style.width = "250px";
        };

        this.closeSideNav = function() {
            $('#sidebar')[0].style.width = "0px";
            $('#map')[0].style.width = '100%';
        };



        // Initialize the google map on the page
        this.initMap();
        this.initInfowindow();
        // Draw the default markers on the page
        this.drawMarkers();
    };

    ko.applyBindings(new viewModel());

};
