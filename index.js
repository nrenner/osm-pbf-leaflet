require('./lib/leaflet-osm.js');
var pbf = require('osm-pbf');

L.OSM.PBF = L.OSM.DataLayer.extend({
	initialize : function(data, options) {
		L.OSM.DataLayer.prototype.initialize.call(this, data, options);
	},
    interestingNode : function(node, ways) {
        if (!node.used) {
            return true;
        }

        for ( var key in node.tags) {
            if (this.options.uninterestingTags.indexOf(key) < 0) {
                return true;
            }
        }

        return false;
    }
});

L.osmPbf = function (data, options) {
    return new L.OSM.PBF(data, options);
};

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
	},
	getNodesPBF : function(buffer) {
		var result = {};

		var blockFile = new pbf.BufferBlockFile(buffer);
		var pbffile = new pbf.PBFFile(blockFile);
		pbffile.nodes(function(node) {
			result[node.id] = {
				id : node.id,
				type : "node",
				latLng : L.latLng(node.lat, node.lon, true),
				tags : node.keyval,
				used : false
			};
		}, function() {
			// finish is not called when process.nextTick shim is synchronous
		});

		return result;
	},

	getWaysPBF : function(buffer, nodes) {
		var result = [];

		var blockFile = new pbf.BufferBlockFile(buffer);
		var pbffile = new pbf.PBFFile(blockFile);
		pbffile.ways(function(way) {
			var len, incomplete = false;
			var way_object = {
				id : way.id,
				type : "way",
				nodes : new Array(way.refs.length),
				tags : way.keysvals
			};

            len = way_object.nodes.length;
			for (var j = 0; j < len; j++) {
			    var node = nodes[way.refs[j]];
			    if (!node) {
			        incomplete = true;
			        break;
			    }
			    way_object.nodes[j] = node;
			    node.used = true;
			}

            //discard incomplete ways
            if (!incomplete) {
                result.push(way_object);
            }
		}, function() {
			// finish is not called when process.nextTick shim is synchronous
		});

		return result;
	}
});
