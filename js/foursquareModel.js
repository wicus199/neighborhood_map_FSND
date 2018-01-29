/**
* @description Model that holds the data from the foursquare response in Knockout observables
* @param {object} data - Response returned from the Foursquare API
* @returns None
*/
var foursquareModel = function(data) {
    this.venueName = ko.observable(data.response.venues[0].name);
    this.venueContact = ko.observable(data.response.venues[0].contact.formattedPhone);
    this.categories = ko.observable(data.response.venues[0].categories[0].name);
    this.location = ko.observable(data.response.venues[0].location.address);
    this.venueStats = ko.observable(data.response.venues[0].stats.checkinsCount);
};
