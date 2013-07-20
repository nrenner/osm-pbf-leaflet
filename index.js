require('./PBFParser.js');
require('./lib/OSMReader.js');
require('./lib/leaflet-osm.js');

L.OSM.PBF = L.OSM.DataLayer.extend({
    options: {
        parser: OSM.PBFParser
    },
    
	initialize : function(data, options) {
		L.OSM.DataLayer.prototype.initialize.call(this, data, options);
	}
});

L.osmPbf = function (data, options) {
    return new L.OSM.PBF(data, options);
};
