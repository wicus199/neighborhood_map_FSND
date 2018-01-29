/**
* @description Function runs when Google maps api could not load
* @param None
* @returns None
*/
var mapFail = function() {
    // Content string to populate error div when Google Maps fails to load
    var content = '<div id="gErrorDiv"><h2 id="gErrorHeading">Something went wrong when connecting to the Google Servers</h2>'+
                  '<p id="gErrorPar">Please try again by reloading the page. Sorry for the inconvenience caused.</p></div>';
    $('#map').html(content);
};

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
        var self = this;
        // Global map variable
        var map;

        // Create an array that will store the list of markers
        this.markersList = ko.observableArray([]);
        // Array to store temporary foursquare markers
        this.tempMarkersList = ko.observableArray([]);
        // Observable to hold foursquare response
        this.fsInstance = ko.observable(0);
        // Observable for the wikipedia article
        this.wikiDiv = ko.observable(0);
        // Observable to hold the selected marker
        this.selectedMarker = ko.observable(0);
        // Observable to hold the text input from the user for a location search
        this.searchQuery = ko.observable('');
        // Create an infowindow object to display third party info on the marker
        this.infowindow = new google.maps.InfoWindow();

        /**
        * @description Function will delete temporary markers created for Foursquare suggested venues
        * @param None
        * @returns None
        */
        this.deleteTempMarkers = function() {
            self.tempMarkersList().forEach(function(currentMarker) {
                // Set the map to null on all the temporary markers
                currentMarker.setMap(null);
            });
            self.tempMarkersList([]);
            // If the window is smaller than 1051, a mobile device is used so close the side navigation when the delete button is clicked
            if ($(window).width() < 1051) {
                self.closeSideNav();
            }
        };

        /**
        * @description Draws the default markers on the map from the marker model data and initializes the foursuare and wikipedia api
        * @param None
        * @returns None
        */
        this.initMarkers = function() {
            // Iterate through the model containing location info
            markers.forEach(function(currentMarker) {
                // Create a marker per location using the Google maps api
                var marker = new google.maps.Marker({
                    position: currentMarker.position,
                    map: map,
                    animation: google.maps.Animation.DROP,
                    title: currentMarker.name
                });

                /*
                * Add the created marker to the model of location data.
                * This is to keep track of which marker is clicked, whether the
                * marker is clicked directly or selected in the list.
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
            // Sets the initial marker to the first marker in the array
            self.selectedMarker(self.markersList()[0].marker);
            // Pass the first marker to the populateWindows function to initialize the page with wikipedia and foursquare info
            self.populateWindows(self.markersList()[0].marker);
        };

        /**
        * @description Initializes the Google Map on the page for the City of Pretoria, South Africa
        * @param None
        * @returns None
        */
        this.initMap = function() {
            // This initializes the Map at the specified location
            map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: -25.814474, lng: 28.244502},
                zoom: 13,
                styles: mapStyles
            });
        };

        /**
        * @description Initializes the Google infowindow and creates a Knockout binding on the first run
        * @param None
        * @returns None
        */
        this.initInfowindow = function() {
            /*
            * Boolean to determine if infowindow was already loaded once before
            * If infowindow was not loaded before, apply a knockout binding to the
            * infowindow div and set the boolean to true
            */
            var windowLoaded = false;
            this.contentString = '<div id="infoWindow"' +
                                'data-bind="template: {name: \'fs-template\', data: fsInstance}">' +
                                '</div>';
            // Set the content of the infowindow to the contentString with knockout data bindings
            self.infowindow.setContent(this.contentString);
            // Add a listener to listen for when the DOM is ready (finished loading)
            google.maps.event.addListener(self.infowindow, 'domready', function() {
                // This will only execute once at the start when the windowLoaded boolean is false
                if (!windowLoaded) {
                    windowLoaded = true;
                    // Apply a binding to the infowindow
                    ko.applyBindings(self, $('#infoWindow')[0]);
                }
            });
        };

        /**
        * @description Populates the InfoWindow and wiki div with 3rd party data
        * @param {object} marker - Marker object for which to open the infowindow
        * @param {boolean} enableWiki - Boolean value to determine if wikipedia info should be requested for the marker
        * @returns None
        */
        this.populateWindows = function(marker, enableWiki) {
            // Function call to retrieve wikipedia info for the marker
            self.getWikipediaInfo(marker, enableWiki);
            // Get foursquare info for the selected marker
            self.getFoursquareInfo(marker);
        };

        /**
        * @description Changes the active marker to the marker clicked on the map or in the list
        * @param {object} clickedItem - Object of clicked list item or marker returned when clicked
        * @returns None
        */
        this.selectMarker = function(clickedItem) {
            /*
            * The ternary expression returns the marker member of the list item or the
            * marker object that was clicked on the map. Clicking on the marker only
            * returns a marker object, while clicking on a list item returns a location
            * object with a marker object as a member. Thus, the ternary expression
            * ensures that either clicked item is handled correctly.
            */
            var clickedMarker = clickedItem.marker ? clickedItem.marker : clickedItem;

            /*
            * Ternary operation returns true if a clicked marker is an original marker
            * and false if the marker is a newly created foursquare marker. This ensures
            * that queries to the wikipedia api are not made with markers that might not
            * have wikipedia info or return the incorrect result.
            */
            var getWiki = clickedItem.marker ? true : false;

            // Change the selected marker observable to the clicked marker
            self.selectedMarker(clickedMarker);
            // Change the center of the map to the coordinates of the selected marker
            map.panTo(clickedMarker.position);
            // Give the marker an animation with a duration of 2 sec using Google Maps api
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
            // Call the functions to open and populate the infowindow with 3rd party data
            self.infowindow.open(map, clickedMarker);
            self.populateWindows(clickedMarker, getWiki);

            /*
            * If the width of the window is smaller than 1050px, close the side
            * navigation menu to ensure a better user experience
            */
            if ($(window).width() <= 1050) {
                self.closeSideNav();
            }
        };

        /**
        * @description Search wikipedia info for the marker location using the wikipedia api
        * @param {object} marker - Current marker object
        * @param {boolean} getWiki - Boolean to determine if wikipedia should search for marker or just the city
        * @returns None
        */
        this.getWikipediaInfo = function(marker, getWiki) {
            // Create url with paramenters to search wikipedia
            // Search parameter will be marker title if getWiki is true and 'Pretoria' if getWiki is false
            var wikiUrl = wikiModel.endpoint + '?' + $.param({
                'action': wikiModel.action,
                'search': getWiki ? marker.title : 'Pretoria',
                'format': wikiModel.format
            });
            /*
            * Start a timeout function to timeout after 5 seconds if wikipedia
            * query does not return a successful response
            */
            var wikiTimeout = setTimeout(function() {
                // If timeout occurs, load wikipedia div with error string
                self.wikiDiv(wikiModel.error);
            }, 5000);

            // Ajax request to retrieve wikipedia articles
            $.ajax({
                url: wikiUrl,
                dataType: 'jsonp',
                success: function(response) {
                    // Query was a success thus clear timeout
                    clearTimeout(wikiTimeout);
                    // If no response exists, fill wikiDiv with generic response
                    if (!response[1][0]) {
                        self.wikiDiv(wikiModel.genericResponse);
                    // If response exists, pass response to wikiDiv to populate div
                    } else {
                        self.wikiDiv(response);
                    }
                }
            });
        };

        /**
        * @description Get Foursquare info on the selected marker
        * @param {object} marker - Currently selected marker object
        * @returns None
        */
        this.getFoursquareInfo = function(marker) {
            // Search the venue for the selected marker
            // Add the lat and lng parameters to the api endpoint to search location
            var searchUrl = fsSearchModel.searchEndpoint + '?' + $.param({
                'll' : marker.position.lat() + ',' + marker.position.lng(),
                'query': marker.title,
                'client_id': fsSearchModel.client_id,
                'client_secret': fsSearchModel.client_secret,
                'v': fsSearchModel.version
            });

            // Ajax request for fetching foursquare info
            $.getJSON(searchUrl, function(responseData) {
                // Create a new foursquare instance by creating a new foursquare model by passing the response data to it
                self.fsInstance(new foursquareModel(responseData));
            // Error handler if ajax request fails
            }).fail(function(xhrObject, status, error) {
                // Set the content of the infowindow to a foursquare error string
                self.infowindow.setContent(fsSearchModel.errorString);
                // Pop up an alert box with the error string
                alert(fsSearchModel.errorString);
            });
        };

        /**
        * @description Get suggested venues using the selected marker and the Foursquare api
        * @param {object} marker - Currently selected marker object
        * @returns None
        */
        this.createFoursquareMarkers = function(marker) {
            // Url to search foursquare for suggested venues
            var exploreUrl = fsSearchModel.exploreEndpoint + '?' + $.param({
                'll': marker.position.lat() + ',' + marker.position.lng(),
                'limit': fsSearchModel.resultLimit,
                'client_id': fsSearchModel.client_id,
                'client_secret': fsSearchModel.client_secret,
                'v': fsSearchModel.version
            });

            // Ajax request to fetch foursquare info
            $.getJSON(exploreUrl, function(responseData) {
                // First, delete the temporary markers if there were any
                self.deleteTempMarkers();
                // Loop through the venues in the response
                responseData.response.groups[0].items.forEach(function(currentItem,index) {
                    // Create new markers for the foursuare suggested venues with a blue marker icon
                    var fsMarker = new google.maps.Marker({
                        position: {lat: currentItem.venue.location.lat, lng: currentItem.venue.location.lng},
                        map: map,
                        animation: google.maps.Animation.DROP,
                        title: currentItem.venue.name,
                        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    });
                    // Push the marker into the temporary markers list
                    self.tempMarkersList.push(fsMarker);
                    // Add a listener to when a marker is clicked to select the marker
                    fsMarker.addListener('click', function() {
                        self.selectMarker(fsMarker);
                    });
                });
                // Close the infowindow to better see the new foursuare markers
                self.infowindow.close();
                // If the window width is smaller than 1051px (mobile), close the side navigation menu for a better user experience
                if ($(window).width() <= 1051) {
                    self.closeSideNav();
                }
            // Error handler to run when the request fails
            }).fail(function(xhrObject, status, error) {
                // Alert the user with an error string
                alert(fsSearchModel.errorString);
            });
        };

        /*
        * Computed observable that uses observable array created at the start to provide search functionality
        * Take query string to lower case in order to always match characters
        */
        this.result = ko.computed(function() {
            // Returns the result if it is true
            return self.markersList().filter(function(currentVal) {
                // Will return true if the letters are present in the correct sequence in location
                if (currentVal.name.toLowerCase().indexOf(self.searchQuery().toLowerCase()) >= 0) {
                    // If the search query is present in the location title, set the map on the marker to map
                    currentVal.marker.setMap(map);
                    return true;
                } else {
                    // If the search query is not present in the location title, set the map on the marker to null
                    currentVal.marker.setMap(null);
                    return false;
                }
            });
        });

        // Same as the other computed observable result, except for foursquare markers
        this.resultFs = ko.computed(function() {
            // Returns the result if it is true
            return self.tempMarkersList().filter(function(currentVal) {
                // Will return true if the letters are present in the correct sequence in location
                if (currentVal.title.toLowerCase().indexOf(self.searchQuery().toLowerCase()) >= 0) {
                    currentVal.setMap(map);
                    return true;
                } else {
                    currentVal.setMap(null);
                    return false;
                }
            });
        });

        // Function to open the side navigation when the menu button is clicked
        /**
        * @description Open the side navigation menu when the menu button is clicked
        * @param None
        * @returns None
        */
        this.openSideNav = function() {
            $('#sidebar')[0].style.width = "250px";
        };

        /**
        * @description Close the side navigation menu when the close button is clicked
        * @param None
        * @returns None
        */
        this.closeSideNav = function() {
            $('#sidebar')[0].style.width = "0px";
            $('#map')[0].style.width = '100%';
        };

        // Initialize the google map on the page
        this.initMap();
        // Initialize the infoWindow
        this.initInfowindow();
        // Draw the default markers on the page
        this.initMarkers();
    };
    // Apply the bindings to the viewModel
    ko.applyBindings(new viewModel());
};
