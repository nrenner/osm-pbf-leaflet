self.OSM = self.OSM || {};

OSM.Reader = function (parser) {
    this.options.parser = parser;
};

OSM.Reader.incl = {
    getParser: function(data) {
        return this.options.parser;
    },

    parseData: function(data) {
        var result = {},
            parser = this.getParser(data);
        result.nodes = parser.getNodes(data);
        result.ways = parser.getWays(data, result.nodes);
        return result;
    },

    buildFeatures: function (obj) {
      var nodeFeatures = [],
        wayFeatures = [],
        areaFeatures = [],
        landuseFeatures = [],
        nodes,
        ways;

      if (!('nodes' in obj && 'ways' in obj)) {
          obj = this.parseData(obj);
      } 
      nodes = obj.nodes;
      ways = obj.ways;
    
      for (var node_id in nodes) {
        var node = nodes[node_id];
        if (this.interestingNode(node, ways)) {
          nodeFeatures.push(node);
        }
      }
    
      for (var i = 0; i < ways.length; i++) {
        var way = ways[i];
        way.area = this.isWayArea(way);
        if (way.area) {
          if (way.tags['landuse']) {
            landuseFeatures.push(way);
          } else {
            areaFeatures.push(way);
          }
        } else {
          wayFeatures.push(way);
        }
      }
    
      // simple feature "layering" through ordering to reduce large features hiding smaller ones
      return landuseFeatures.concat(areaFeatures).concat(wayFeatures).concat(nodeFeatures);
    },
    
    isWayArea: function (way) {
      if (way.nodes[0] != way.nodes[way.nodes.length - 1]) {
        return false;
      }
    
      if (way.tags['area'] === 'no') {
        return false;
      }
    
      for (var key in way.tags) {
        if (~this.options.areaTags.indexOf(key)) {
          return true;
        }
      }
    
      return false;
    },
    
    interestingNode: function (node, ways) {
      var used = false;
    
      for (var i = 0; i < ways.length; i++) {
        if (ways[i].nodes.indexOf(node) >= 0) {
          used = true;
          break;
        }
      }
    
      if (!used) {
        return true;
      }
    
      for (var key in node.tags) {
        if (this.options.uninterestingTags.indexOf(key) < 0) {
          return true;
        }
      }
    
      return false;
    }
};

OSM.Reader.prototype.parseData = OSM.Reader.incl.parseData;
OSM.Reader.prototype.buildFeatures = OSM.Reader.incl.buildFeatures;
OSM.Reader.prototype.isWayArea = OSM.Reader.incl.isWayArea;
OSM.Reader.prototype.interestingNode = OSM.Reader.incl.interestingNode;
OSM.Reader.prototype.getParser = OSM.Reader.incl.getParser;

OSM.Reader.prototype.options = {
    areaTags: ['area', 'building', 'leisure', 'tourism', 'ruins', 'historic', 'landuse', 'military', 'natural', 'sport'],
    uninterestingTags: ['source', 'source_ref', 'source:ref', 'history', 'attribution', 'created_by', 'tiger:county', 'tiger:tlid', 'tiger:upload_uuid']
};
