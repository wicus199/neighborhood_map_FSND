
var foursquareModel = function(data) {
    this.venueName = ko.observable(data.response.venues[0].name);
    this.venueContact = ko.observable(data.response.venues[0].contact.formattedPhone);
    this.categories = ko.observable(data.response.venues[0].categories[0].name);
    this.location = ko.observable(data.response.venues[0].location.address);
    this.venueStats = ko.observable(data.response.venues[0].stats.checkinsCount);
};

// Obviousliy venueName is not going to exist. The response data is passed in.
// In the response data, only the json response exist
