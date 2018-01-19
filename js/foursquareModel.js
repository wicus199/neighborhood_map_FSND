/*
var venueId;
var venueContact = {};
var venueCategories = [];
var venueStats;
var venueUrl;
*/
var foursquareModel = function(data) {
    this.venueName = ko.observable(data.response.venues[0].name);
    this.venueContact = ko.observable(data.response.venues[0].contact.formattedPhone);
    this.categories = ko.observable(data.response.venues[0].categories[0].name);

    //foursquareModel.venueName = responseData.response.venues[0].name;
    //foursquareModel.venueContact = responseData.response.venues[0].contact.formattedPhone;
    //foursquareModel.categories = responseData.response.venues[0].categories[0].name;
    //foursquareModel.location = responseData.response.venues[0].location.address;
    //foursquareModel.venueStats = responseData.response.venues[0].stats.checkinsCount;
    //this.location = ko.observable(data.location);
    //this.venueStats = ko.observable(data.venueStats);
};

// Obviousliy venueName is not going to exist. The response data is passed in.
// In the response data, only the json response exist
