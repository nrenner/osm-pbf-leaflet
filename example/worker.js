importScripts('../dist/osm-pbf-worker.js');

self.addEventListener('message', function(e) {
    var osmData = new OSM.Reader(OSM.PBFParser);
    var features = osmData.buildFeatures(e.data);
    self.postMessage(features);
}, false);
