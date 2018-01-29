# Neighborhood Map Project

The application is a Neighborhood maps website that explores the city of Pretoria in South Africa. Notable venues are listed by default on a map provided by the Google Maps API. The Foursquare API is used to provide info on the default locations and display recommended venues. Each default location queries Wikipedia when clicked, with the application displaying the wikipedia info on the page. If any other venue (recommended venues) is selected, Wikipedia is queried for Pretoria, and not a specific venue.

This project was done as part of the Udacity Full Stack Web Developer Nanodegree course. The Knockout
framework is used and the project follows a MVVM pattern.

## Installation

Everything is contained within the project folder with no installations needed. The project was developed
for the Google chrome browser but it should work fine with all major browsers.

Clone or download the project to your local machine and open the index.html file in your browser of choice.


## Usage

When opening the app in a browser, common steps to follow are the following:

* Either on the map or in the **Explore Pretoria** section, select (click) a location of interest.
* When the user clicks on a location (either a marker or location in the list), an infowindow opens with Foursquare data shown for the location.
* Wikipedia info is also displayed for the selected marker with a button that opens the wikipedia page when clicked.
* The user then has the option to show markers on the map using the foursqaure recommended venues endpoint by clicking the **Show suggested places** button.
* The foursuare markers (blue) are then displayed on the map and in the **Suggested Places** section.
* Each foursquare marker can also be clicked to display foursqaure data for that location.
* The **Hide suggested places** button can be clicked to remove the Foursquare markers from the map and **Suggested Places** section.
* The user can search a venue (default or suggested) by typing into the filter box at the top of the side navigation bar.
* Locations will update as the user types, with locations that do not match the search term being hidden in the side navigation menu and on the map.


## Known Bugs

When switching between mobile and desktop versions of the app in Google Chrome using the Developer console, the page might need to be reloaded otherwise the map gets stuck.

## Future Work

* Add images of venues to the infoWindow
* Add property listings to the app
* Add a radius input to allow the user to choose a radius within which to display recommended venues

## Source Attribution

Third party API data used in the project are:
* Foursquare API to search recommended venues and provide info for locations
* Wikipedia API to provide Wikipedia info for all of the default locations on the map
* Google Maps API to provide the map, markers and infowindows for the locations
