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
/*
L.OSM.getNodesXML = L.OSM.getNodes;
L.OSM.getWaysXML = L.OSM.getWays;

L.Util.extend(L.OSM, {
	getNodes : function(data) {
		if (data instanceof ArrayBuffer) {
			return L.OSM.getNodesPBF(data);
		} else {
			return L.OSM.getNodesXML(data);
		}
	},
	getWays : function(data, nodes) {
		if (data instanceof ArrayBuffer) {
			return L.OSM.getWaysPBF(data, nodes);
		} else {
			return L.OSM.getWaysXML(data, nodes);
		}
	}
});

L.Util.extend(L.OSM, OSM.PBFParser);
*/
