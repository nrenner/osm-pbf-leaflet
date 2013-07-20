require('./lib/OSMReader.js');
var pbf = require('osm-pbf');

OSM.Reader.prototype.interestingNode = function(node, ways) {
    if (!node.used) {
        return true;
    }

    for ( var key in node.tags) {
        if (this.options.uninterestingTags.indexOf(key) < 0) {
            return true;
        }
    }

    return false;
};

OSM.PBFParser = {
    getNodes: function(buffer) {
        var result = {};

        var blockFile = new pbf.BufferBlockFile(buffer);
        var pbffile = new pbf.PBFFile(blockFile);
        pbffile.nodes(function(node) {
            result[node.id] = {
                id : node.id,
                type : "node",
                lat: node.lat, 
                lon: node.lon,
                tags : node.keyval,
                used : false
            };
        }, function() {
            // finish is not called when process.nextTick shim is synchronous
        });

        return result;
    },

    getWays: function(buffer, nodes) {
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
};