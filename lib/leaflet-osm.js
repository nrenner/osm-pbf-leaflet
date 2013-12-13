L.OSM = {};

L.OSM.TileLayer = L.TileLayer.extend({
  options: {
    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a target="_parent" href="http://www.openstreetmap.org">OpenStreetMap</a> and contributors, under an <a target="_parent" href="http://www.openstreetmap.org/copyright">open license</a>'
  },

  initialize: function (options) {
    options = L.Util.setOptions(this, options);
    L.TileLayer.prototype.initialize.call(this, options.url);
  }
});

L.OSM.Mapnik = L.OSM.TileLayer.extend({
  options: {
    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19
  }
});

L.OSM.CycleMap = L.OSM.TileLayer.extend({
  options: {
    url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
  }
});

L.OSM.TransportMap = L.OSM.TileLayer.extend({
  options: {
    url: 'http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png'
  }
});

L.OSM.MapQuestOpen = L.OSM.TileLayer.extend({
  options: {
    url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
    subdomains: '1234',
    attribution: "Tiles courtesy of <a href='http://www.mapquest.com/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png'>"
  }
});

L.OSM.DataLayer = L.FeatureGroup.extend({
  options: {
    styles: {},
    parser: L.OSM
  },

  initialize: function (xml, options) {
    L.Util.setOptions(this, options);

    L.FeatureGroup.prototype.initialize.call(this);

    if (xml) {
      this.addData(xml);
    }
  },

  addData: function (features) {
    if (!(features instanceof Array)) {
      features = this.buildFeatures(features);
    }

    for (var i = 0; i < features.length; i++) {
      var feature = features[i], layer, latLng, node;
      
      if (this.options.filter && !this.options.filter(feature, this)) { 
          continue;
      }

      if (feature.type === "node") {
        latLng = L.latLng(feature.lat, feature.lon);
        layer = L.circleMarker(latLng, this.options.styles.node);
      } else {
        var latLngs = new Array(feature.nodes.length);

        for (var j = 0; j < feature.nodes.length; j++) {
          node = feature.nodes[j];
          latLngs[j] = L.latLng(node.lat, node.lon);
        }

        if (feature.area) {
          latLngs.pop(); // Remove last == first.
          layer = L.polygon(latLngs, this.options.styles.area);
        } else {
          layer = L.polyline(latLngs, this.options.styles.way);
        }
      }

      this.addLayer(layer);
      layer.feature = feature;

      if (this.options.onEachFeature) {
        this.options.onEachFeature(feature, layer);
      }      
    }
  }
});

L.OSM.DataLayer.mergeOptions(OSM.Reader.prototype.options);
L.OSM.DataLayer.include(OSM.Reader.incl);

L.Util.extend(L.OSM, {
  getNodes: function (xml) {
    var result = {};

    var nodes = xml.getElementsByTagName("node");
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i], id = node.getAttribute("id");
      result[id] = {
        id: id,
        type: "node",
        lat: node.getAttribute("lat"),
        lon: node.getAttribute("lon"),
        tags: this.getTags(node),
        used: false
      };
    }

    return result;
  },

  getWays: function (xml, nodes) {
    var result = [];

    var ways = xml.getElementsByTagName("way");
    for (var i = 0; i < ways.length; i++) {
      var way = ways[i], nds = way.getElementsByTagName("nd");

      var way_object = {
        id: way.getAttribute("id"),
        type: "way",
        nodes: new Array(nds.length),
        tags: this.getTags(way)
      };

      for (var j = 0; j < nds.length; j++) {
        var node = nodes[nds[j].getAttribute("ref")];
        way_object.nodes[j] = node;
        node.used = true;
      }

      result.push(way_object);
    }

    return result;
  },

  getTags: function (xml) {
    var result = {};

    var tags = xml.getElementsByTagName("tag");
    for (var j = 0; j < tags.length; j++) {
      result[tags[j].getAttribute("k")] = tags[j].getAttribute("v");
    }

    return result;
  }
});
