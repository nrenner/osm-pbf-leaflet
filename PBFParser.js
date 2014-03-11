self.OSM = self.OSM || {};

var pbfParser = require('osm-read');

OSM.PBFParser = {
    getNodes: function(buffer) {
        var nodes = {};
        var ways = [];

        pbfParser.parse({
            buffer: buffer,
            endDocument: function(){},
            bounds: function(bounds){},
            node: function(node){
                node.type = "node";
                node.used = false;
                nodes[node.id] = node;
            },
            way: function(way){
                var len, incomplete = false;

                way.type = "way";
                way.nodes = new Array(way.nodeRefs.length),

                len = way.nodes.length;
                for (var j = 0; j < len; j++) {
                    var node = nodes[way.nodeRefs[j]];
                    if (!node) {
                        incomplete = true;
                        break;
                    }
                    way.nodes[j] = node;
                    node.used = true;
                }
                
                delete way.nodeRefs;

                //discard incomplete ways
                if (!incomplete) {
                    ways.push(way);
                }
            },
            error: function(msg){
                console.log('error: ' + msg);
                throw msg;
            }
        });

        nodes.ways = ways;

        return nodes;
    },

    getWays: function(buffer, nodes) {
        // quick hack to avoid two-pass read: ways passed from getNodes
        var ways = nodes.ways;
        delete nodes.ways;
        return ways;
    }
};