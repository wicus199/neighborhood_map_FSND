// Model object to store parameters used in the foursquare ajax call
fsSearchModel = {
    searchEndpoint:  'https://api.foursquare.com/v2/venues/search',
    exploreEndpoint: 'https://api.foursquare.com/v2/venues/explore',
    errorString:     'The Foursquare API could not be reached, please reload the website',
    resultLimit:     '10',
    client_id:       'G0SN05EYUPGJZLV5VZ4KEP4W3RLXVHCUR3ZVMZYLLZAP1RHT',
    client_secret:   'JIZ1ZUOUCHAHOH1EL0DPMFAV01UK3QFBSAO33GY0XRRUHTTL',
    version:         '20180112'
};

// Model object to store parameters used in the wikipedia ajax call
wikiModel = {
    endpoint:       'https://en.wikipedia.org/w/api.php',
    action:         'opensearch',
    format:         'json',
    genericResponse: [["Generic Response"],
                     ["No Info"],
                     ["There are no wikipedia info for this marker!"]],
    error:           [[''],
                     ['An error occurred'],
                     ['Failed to reach wikipedia servers'],
                     ['']]
};
