(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"osm-read":5}],2:[function(require,module,exports){
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

},{"./PBFParser.js":1,"./lib/OSMReader.js":3,"./lib/leaflet-osm.js":4}],3:[function(require,module,exports){
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
      if (!node.used) {
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

},{}],4:[function(require,module,exports){
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

      if (this.options.renderer) {
          layer.options.renderer = this.options.renderer;
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

},{}],5:[function(require,module,exports){
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.pbfParser=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var buf = _dereq_('./buffer.js');

function readBlobHeaderSize(fd, position, size, callback){
    var headerSize = new DataView(fd).getInt32(position, false);
    return callback(null, headerSize);
}

function readPBFElement(fd, position, size, pbfDecode, callback){
    //var buffer = new Uint8Array(fd, position, size);
    var buffer = new Uint8Array(size);
    buffer.set(new Uint8Array(fd, position, size));
    return buf.readPBFElementFromBuffer(buffer, pbfDecode, callback);
}

function getFileSize(fd, callback){
    return callback(null, fd.byteLength);
}

function get(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onerror = function(evt) {
        callback(new Error(this.status + ': ' + this.statusText));
    };
    xhr.onload = function(evt) {
        callback(null, this.response);
    };
    xhr.send();
}

function open(opts, callback){
    if (opts.filePath) {
        get(opts.filePath, callback);
    } else if (opts.buffer) {
        callback(null, opts.buffer);
    } else {
        callback(new Error('Use either the "filePath" option to pass an URL'
            + ' or the "buffer" option to pass an ArrayBuffer.'));
    }
}

function close(fd, callback){
    if (callback) {
        callback(null);
    }
}

module.exports = {
    readBlobHeaderSize: readBlobHeaderSize,
    readPBFElement: readPBFElement,
    getFileSize: getFileSize,
    open: open,
    close: close
};

},{"./buffer.js":2}],2:[function(_dereq_,module,exports){
function readPBFElementFromBuffer(buffer, pbfDecode, callback){
    return callback(null, pbfDecode(buffer));
}

function blobDataToBuffer(blob){
    return new Uint8Array(blob.toArrayBuffer());
}

module.exports = {
    readPBFElementFromBuffer: readPBFElementFromBuffer,
    blobDataToBuffer: blobDataToBuffer
};

},{}],3:[function(_dereq_,module,exports){
// don't use npm 'zlibjs' module, would require shims for the Node.js wrappers
var Zlib = _dereq_('../../node_modules/zlibjs/bin/inflate.min.js').Zlib;
var buf = _dereq_('./buffer.js');

function inflateBlob(blob, callback){
    var infl = new Zlib.Inflate(buf.blobDataToBuffer(blob.zlib_data), {
        bufferSize: blob.raw_size
    });
    return callback(null, infl.decompress());
}

module.exports = {
    inflateBlob: inflateBlob
};

},{"../../node_modules/zlibjs/bin/inflate.min.js":15,"./buffer.js":2}],4:[function(_dereq_,module,exports){
function toArrayBuffer(buffer) {
    /*
     * took this function from
     * http://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
     */
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}

function readPBFElementFromBuffer(buffer, pbfDecode, callback){
    return callback(null, pbfDecode(toArrayBuffer(buffer)));
}

function pbfBufferToBuffer(src, srcOffset, len){
    var from, to, i;

    from = src.view;
    to = new Buffer(len);

    for(i = 0; i < len; ++i){
        to.writeUInt8(from.getUint8(i + srcOffset), i);
    }

    return to;
}

function blobDataToBuffer(blob){
    var from, len, offset;

    from = blob.view;

    // TODO find out where the offset comes from!?!
    offset = 0; //6; // 4
    for(offset = 0; offset < from.byteLength - 1; ++offset){
        if(from.getUint16(offset) === 0x789c){
            break;
        }
    }

    len = from.byteLength - offset;

    return pbfBufferToBuffer(blob, offset, len);
}

module.exports = {
    readPBFElementFromBuffer: readPBFElementFromBuffer,
    blobDataToBuffer: blobDataToBuffer
};

},{}],5:[function(_dereq_,module,exports){
var fs = _dereq_('fs');
var buf = _dereq_('./buffer.js');

function bytesReadFail(callback, expectedBytes, readBytes){
    return callback(new Error('Expected ' + expectedBytes + ' bytes but got ' + readBytes));
}

function readBlobHeaderSize(fd, position, size, callback){
    var buffer;

    buffer = new Buffer(size);

    fs.read(fd, buffer, 0, size, position, function(err, bytesRead, buffer){
        if(bytesRead !== size){
            return bytesReadFail(callback, size, bytesRead);
        }

        return callback(null, buffer.readInt32BE(0));
    });
}

function readPBFElement(fd, position, size, pbfDecode, callback){
    var buffer;

    if(size > 32 * 1024 * 1024){
        return callback(new Error('PBF element too big: ' + size + ' bytes'));
    }

    buffer = new Buffer(size);

    fs.read(fd, buffer, 0, size, position, function(err, bytesRead, buffer){
        if(bytesRead !== size){
            return bytesReadFail(callback, size, bytesRead);
        }

        return buf.readPBFElementFromBuffer(buffer, pbfDecode, callback);
    });
}

function getFileSize(fd, callback){
    fs.fstat(fd, function(err, fdStatus){
        return callback(err, fdStatus.size);
    });
}

function open(opts, callback){
    fs.open(opts.filePath, 'r', callback);
}

function close(fd, callback){
    return fs.close(fd, callback);
}

module.exports = {
    readBlobHeaderSize: readBlobHeaderSize,
    readPBFElement: readPBFElement,
    getFileSize: getFileSize,
    open: open,
    close: close
};

},{"./buffer.js":4}],6:[function(_dereq_,module,exports){
var zlib = _dereq_('zlib');
var buf = _dereq_('./buffer.js');

function inflateBlob(blob, callback){
    zlib.inflate(buf.blobDataToBuffer(blob.zlib_data), callback);
}

module.exports = {
    inflateBlob: inflateBlob
};
},{"./buffer.js":4}],7:[function(_dereq_,module,exports){
/*
 * The following little overview extends the osm pbf file structure description
 * from http://wiki.openstreetmap.org/wiki/PBF_Format:
 *
 * - [1] file
 *   - [n] file blocks
 *     - [1] blob header
 *     - [1] blob
 */

var protoBuf = _dereq_("protobufjs");
var zlib, buf, reader;

// check if running in Browser or Node.js (use self not window because of Web Workers)
if (typeof self !== 'undefined') {
    zlib = _dereq_('./browser/zlib.js');
    buf = _dereq_('./browser/buffer.js');
    reader = _dereq_('./browser/arrayBufferReader.js');
} else {
    zlib = _dereq_('./nodejs/zlib.js');
    buf = _dereq_('./nodejs/buffer.js');
    reader = _dereq_('./nodejs/fsReader.js');
}

var fileFormat = _dereq_('./proto/fileformat.js');
var blockFormat = _dereq_('./proto/osmformat.js');

var BLOB_HEADER_SIZE_SIZE = 4;

function readBlobHeaderContent(fd, position, size, callback){
    return reader.readPBFElement(fd, position, size, fileFormat.BlobHeader.decode, callback);
}

function readFileBlock(fd, position, callback){
    reader.readBlobHeaderSize(fd, position, BLOB_HEADER_SIZE_SIZE, function(err, blobHeaderSize){
        if(err){
            return callback(err);
        }

        return readBlobHeaderContent(fd, position + BLOB_HEADER_SIZE_SIZE, blobHeaderSize, function(err, blobHeader){
            if(err){
                return callback(err);
            }

            blobHeader.position = position + BLOB_HEADER_SIZE_SIZE + blobHeaderSize;

            return callback(err, {
                position: position,
                size: BLOB_HEADER_SIZE_SIZE + blobHeaderSize + blobHeader.datasize,
                blobHeader: blobHeader
            });
        });
    });
}

function readFileBlocks(fd, callback){
    reader.getFileSize(fd, function(err, fileSize){
        var position, fileBlocks;

        position = 0;
        fileBlocks = [];

        function readNextFileBlock(){
            readFileBlock(fd, position, function(err, fileBlock){
                if(err){
                    return callback(err);
                }

                fileBlocks.push(fileBlock);

                position = fileBlock.position + fileBlock.size;

                if(position < fileSize){
                    readNextFileBlock();
                }
                else{
                    return callback(null, fileBlocks);
                }
            });
        }

        readNextFileBlock();
    });
}

function getStringTableEntry(i){
    var s, str;

    // decode StringTable entry only once and cache
    if (i in this.cache) {
        str = this.cache[i];
    } else {
        s = this.s[i];

        // obviously someone is missinterpreting the meanding of 'offset'
        // and 'length'. they should be named 'start' and 'end' instead.
        str = s.readUTF8StringBytes(s.length - s.offset, s.offset).string;
        this.cache[i] = str;
    }

    return str;
}

function extendStringTable(st){
    st.cache = {};
    st.getEntry = getStringTableEntry;
}

function createNodesView(pb, pg){
    var length, tagsList, deltaData;

    if(pg.nodes.length !== 0){
        throw new Error('primitivegroup.nodes.length !== 0 not supported yet');
    }

    length = 0;

    if(pg.dense){
        length = pg.dense.id.length;
    }

    function createTagsList(){
        var tagsList, i, tagsListI, tags, keyId, keysVals, valId, key, val;

        if(!pg.dense){
            return null;
        }

        keysVals = pg.dense.keys_vals;
        tags = {};
        tagsList = [];

        for(i = 0; i < keysVals.length;){
            keyId = keysVals[i++];

            if(keyId === 0){
                tagsList.push(tags);

                tags = {};

                continue;
            }
            
            valId = keysVals[i++];

            key = pb.stringtable.getEntry(keyId);
            val = pb.stringtable.getEntry(valId);

            tags[key] = val;
        }

        return tagsList;
    }

    tagsList = createTagsList();

    function collectDeltaData(){
        var i, id, timestamp, changeset, uid, userIndex, deltaDataList, deltaData, lat, lon;

        if(!pg.dense){
            return null;
        }

        id = 0;
        lat = 0;
        lon = 0;

        if(pg.dense.denseinfo){
            timestamp = 0;
            changeset = 0;
            uid = 0;
            userIndex = 0;
        }

        deltaDataList = [];

        for(i = 0; i < length; ++i){
            // TODO we should test wheather adding 64bit numbers works fine with high values
            id += pg.dense.id[i].toNumber();

            lat += pg.dense.lat[i].toNumber();
            lon += pg.dense.lon[i].toNumber();

            deltaData = {
                id: id,
                lat: lat,
                lon: lon
            };

            if(pg.dense.denseinfo){
                // TODO we should test wheather adding 64bit numbers works fine with high values
                timestamp += pg.dense.denseinfo.timestamp[i].toNumber();
                changeset += pg.dense.denseinfo.changeset[i].toNumber();

                // TODO we should test wheather adding 64bit numbers works fine with high values
                uid += pg.dense.denseinfo.uid[i];

                userIndex += pg.dense.denseinfo.user_sid[i];

                deltaData.timestamp = timestamp * pb.date_granularity;
                deltaData.changeset = changeset;
                deltaData.uid = uid;
                deltaData.userIndex = userIndex;
            }

            deltaDataList.push(deltaData);
        }

        return deltaDataList;
    }

    deltaData = collectDeltaData();

    function get(i){
        var node, nodeDeltaData;

        nodeDeltaData = deltaData[i];

        node = {
            id: '' + nodeDeltaData.id,
            lat: (pb.lat_offset.toNumber() + (pb.granularity * nodeDeltaData.lat)) / 1000000000,
            lon: (pb.lon_offset.toNumber() + (pb.granularity * nodeDeltaData.lon)) / 1000000000,
            tags: tagsList[i]
        };

        if(pg.dense.denseinfo){
            node.version = pg.dense.denseinfo.version[i];
            node.timestamp = nodeDeltaData.timestamp;
            node.changeset = nodeDeltaData.changeset;
            node.uid = '' + nodeDeltaData.uid;
            node.user = pb.stringtable.getEntry(nodeDeltaData.userIndex);
        }

        return node;
    }

    return {
        length: length,
        get: get
    };
}

function createWaysView(pb, pg){
    var length;

    length = pg.ways.length;

    function get(i){
        var way, result, info;

        way = pg.ways[i];

        function createTagsObject(){
            var tags, i, keyI, valI, key, val;

            tags = {};

            for(i = way.keys.length - 1; i >= 0; --i){
                keyI = way.keys[i];
                valI = way.vals[i];

                key = pb.stringtable.getEntry(keyI);
                val = pb.stringtable.getEntry(valI);

                tags[key] = val;
            }

            return tags;
        }

        function createNodeRefIds(){
            var nodeIds, lastRefId, i;

            nodeIds = [];
            lastRefId = 0;

            for(i = 0; i < way.refs.length; ++i){
                // TODO we should test wheather adding 64bit numbers works fine with high values
                lastRefId += way.refs[i].toNumber();

                nodeIds.push('' + lastRefId);
            }

            return nodeIds;
        }

        result = {
            id: way.id.toString(),
            tags: createTagsObject(),
            nodeRefs: createNodeRefIds()
        };

        if (way.info) {
            info = way.info;
            if (info.version) {
                result.version = info.version;
            }
            if (info.timestamp) {
                result.timestamp = info.timestamp.toNumber() * pb.date_granularity;
            }
            if (info.changeset) {
                result.changeset = info.changeset.toNumber();
            }
            if (info.uid) {
                result.uid = '' + info.uid;
            }
            if (info.user_sid) {
                result.user = pb.stringtable.getEntry(info.user_sid);
            }
        }

        return result;
    }

    return {
        length: length,
        get: get
    };
}

function extendPrimitiveGroup(pb, pg){
    pg.nodesView = createNodesView(pb, pg);
    pg.waysView = createWaysView(pb, pg);
}

function decodePrimitiveBlock(buffer){
    var data, i;

    data = blockFormat.PrimitiveBlock.decode(buffer);

    // extend stringtable
    extendStringTable(data.stringtable);

    // extend primitivegroup
    for(i = 0; i < data.primitivegroup.length; ++i){
        extendPrimitiveGroup(data, data.primitivegroup[i]);
    }

    return data;
}

var OSM_BLOB_DECODER_BY_TYPE = {
    'OSMHeader': blockFormat.HeaderBlock.decode,
    'OSMData': decodePrimitiveBlock
};

function createFileParser(fd, callback){
    readFileBlocks(fd, function(err, fileBlocks){
        if(err){
            return callback(err);
        }

        function findFileBlocksByBlobType(blobType){
            var blocks, i, block;

            blocks = [];

            for(i = 0; i < fileBlocks.length; ++i){
                block = fileBlocks[i];

                if(block.blobHeader.type !== blobType){
                    continue;
                }

                blocks.push(block);
            }

            return blocks;
        }

        function readBlob(fileBlock, callback){
            return reader.readPBFElement(fd, fileBlock.blobHeader.position, fileBlock.blobHeader.datasize, fileFormat.Blob.decode, callback);
        }

        function readBlock(fileBlock, callback){
            return readBlob(fileBlock, function(err, blob){
                if(err){
                    return callback(err);
                }

                if(blob.raw_size === 0){
                    return callback('Uncompressed pbfs are currently not supported.');
                }

                zlib.inflateBlob(blob, function(err, data){
                    if(err){
                        return callback(err);
                    }

                    return buf.readPBFElementFromBuffer(data, OSM_BLOB_DECODER_BY_TYPE[fileBlock.blobHeader.type], callback);
                });
            });
        }

        return callback(null, {
            fileBlocks: fileBlocks,
            
            findFileBlocksByBlobType: findFileBlocksByBlobType,

            readBlock: readBlock
        });
    });
}

function createPathParser(opts){
    reader.open(opts, function(err, fd){
        createFileParser(fd, function(err, parser){
            if(err){
                return opts.callback(err);
            }

            parser.close = function(callback){
                return reader.close(fd, callback);
            };

            return opts.callback(null, parser);
        });
    });
}

function visitOSMHeaderBlock(block, opts){
    // TODO
}

function visitPrimitiveGroup(pg, opts){
    var i;

    // visit nodes
    for(i = 0; i < pg.nodesView.length; ++i){
        opts.node(pg.nodesView.get(i));
    }

    // visit ways
    for(i = 0; i < pg.waysView.length; ++i){
        opts.way(pg.waysView.get(i));
    }
}

function visitOSMDataBlock(block, opts){
    var i;

    for(i = 0; i < block.primitivegroup.length; ++i){
        visitPrimitiveGroup(block.primitivegroup[i], opts);
    }
}

var BLOCK_VISITORS_BY_TYPE = {
    OSMHeader: visitOSMHeaderBlock,
    OSMData: visitOSMDataBlock
};

function visitBlock(fileBlock, block, opts){
    BLOCK_VISITORS_BY_TYPE[fileBlock.blobHeader.type](block, opts);
}

function parse(opts){
    return createPathParser({
        filePath: opts.filePath,
        buffer: opts.buffer,
        callback: function(err, parser){
            var nextFileBlockIndex;

            function fail(err){
                parser.close();

                return opts.error(err);
            }
            
            if(err){
                return fail(err);
            }

            nextFileBlockIndex = 0;

            function visitNextBlock(){
                var fileBlock;

                if(nextFileBlockIndex >= parser.fileBlocks.length){
                    parser.close();

                    opts.endDocument();

                    return;
                }

                fileBlock = parser.fileBlocks[nextFileBlockIndex];

                parser.readBlock(fileBlock, function(err, block){
                    if(err){
                        return fail(err);
                    }

                    visitBlock(fileBlock, block, opts);

                    nextFileBlockIndex += 1;

                    visitNextBlock();
                });
            }

            visitNextBlock();
        }
    });
}

module.exports = {
    parse: parse,

    createParser: createPathParser
};

},{"./browser/arrayBufferReader.js":1,"./browser/buffer.js":2,"./browser/zlib.js":3,"./nodejs/buffer.js":4,"./nodejs/fsReader.js":5,"./nodejs/zlib.js":6,"./proto/fileformat.js":8,"./proto/osmformat.js":9,"protobufjs":10}],8:[function(_dereq_,module,exports){
module.exports = _dereq_("protobufjs").newBuilder().import({
    "package": "OSMPBF",
    "messages": [
        {
            "name": "Blob",
            "fields": [
                {
                    "rule": "optional",
                    "type": "bytes",
                    "name": "raw",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "raw_size",
                    "id": 2,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "bytes",
                    "name": "zlib_data",
                    "id": 3,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "bytes",
                    "name": "lzma_data",
                    "id": 4,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "bytes",
                    "name": "OBSOLETE_bzip2_data",
                    "id": 5,
                    "options": {
                        "deprecated": true
                    }
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "BlobHeader",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "type",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "bytes",
                    "name": "indexdata",
                    "id": 2,
                    "options": {}
                },
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "datasize",
                    "id": 3,
                    "options": {}
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        }
    ],
    "enums": [],
    "imports": [],
    "options": {
        "optimize_for": "LITE_RUNTIME",
        "java_package": "org.openstreetmap.osmosis.osmbinary"
    },
    "services": []
}).build("OSMPBF");

},{"protobufjs":10}],9:[function(_dereq_,module,exports){
module.exports = _dereq_("protobufjs").newBuilder().import({
    "package": "OSMPBF",
    "messages": [
        {
            "name": "HeaderBlock",
            "fields": [
                {
                    "rule": "optional",
                    "type": "HeaderBBox",
                    "name": "bbox",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "string",
                    "name": "required_features",
                    "id": 4,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "string",
                    "name": "optional_features",
                    "id": 5,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "writingprogram",
                    "id": 16,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "source",
                    "id": 17,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "osmosis_replication_timestamp",
                    "id": 32,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "osmosis_replication_sequence_number",
                    "id": 33,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "osmosis_replication_base_url",
                    "id": 34,
                    "options": {}
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "HeaderBBox",
            "fields": [
                {
                    "rule": "required",
                    "type": "sint64",
                    "name": "left",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "required",
                    "type": "sint64",
                    "name": "right",
                    "id": 2,
                    "options": {}
                },
                {
                    "rule": "required",
                    "type": "sint64",
                    "name": "top",
                    "id": 3,
                    "options": {}
                },
                {
                    "rule": "required",
                    "type": "sint64",
                    "name": "bottom",
                    "id": 4,
                    "options": {}
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "PrimitiveBlock",
            "fields": [
                {
                    "rule": "required",
                    "type": "StringTable",
                    "name": "stringtable",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "PrimitiveGroup",
                    "name": "primitivegroup",
                    "id": 2,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "granularity",
                    "id": 17,
                    "options": {
                        "default": 100
                    }
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "lat_offset",
                    "id": 19,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "lon_offset",
                    "id": 20,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "date_granularity",
                    "id": 18,
                    "options": {
                        "default": 1000
                    }
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "PrimitiveGroup",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "Node",
                    "name": "nodes",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "DenseNodes",
                    "name": "dense",
                    "id": 2,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "Way",
                    "name": "ways",
                    "id": 3,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "Relation",
                    "name": "relations",
                    "id": 4,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "ChangeSet",
                    "name": "changesets",
                    "id": 5,
                    "options": {}
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "StringTable",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "bytes",
                    "name": "s",
                    "id": 1,
                    "options": {}
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "Info",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "version",
                    "id": 1,
                    "options": {
                        "default": -1
                    }
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "timestamp",
                    "id": 2,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "changeset",
                    "id": 3,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "uid",
                    "id": 4,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "uint32",
                    "name": "user_sid",
                    "id": 5,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "bool",
                    "name": "visible",
                    "id": 6,
                    "options": {}
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "DenseInfo",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "int32",
                    "name": "version",
                    "id": 1,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "sint64",
                    "name": "timestamp",
                    "id": 2,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "sint64",
                    "name": "changeset",
                    "id": 3,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "sint32",
                    "name": "uid",
                    "id": 4,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "sint32",
                    "name": "user_sid",
                    "id": 5,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "bool",
                    "name": "visible",
                    "id": 6,
                    "options": {
                        "packed": true
                    }
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "ChangeSet",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "id",
                    "id": 1,
                    "options": {}
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "Node",
            "fields": [
                {
                    "rule": "required",
                    "type": "sint64",
                    "name": "id",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "uint32",
                    "name": "keys",
                    "id": 2,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "uint32",
                    "name": "vals",
                    "id": 3,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "optional",
                    "type": "Info",
                    "name": "info",
                    "id": 4,
                    "options": {}
                },
                {
                    "rule": "required",
                    "type": "sint64",
                    "name": "lat",
                    "id": 8,
                    "options": {}
                },
                {
                    "rule": "required",
                    "type": "sint64",
                    "name": "lon",
                    "id": 9,
                    "options": {}
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "DenseNodes",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "sint64",
                    "name": "id",
                    "id": 1,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "optional",
                    "type": "DenseInfo",
                    "name": "denseinfo",
                    "id": 5,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "sint64",
                    "name": "lat",
                    "id": 8,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "sint64",
                    "name": "lon",
                    "id": 9,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "int32",
                    "name": "keys_vals",
                    "id": 10,
                    "options": {
                        "packed": true
                    }
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "Way",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "id",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "uint32",
                    "name": "keys",
                    "id": 2,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "uint32",
                    "name": "vals",
                    "id": 3,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "optional",
                    "type": "Info",
                    "name": "info",
                    "id": 4,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "sint64",
                    "name": "refs",
                    "id": 8,
                    "options": {
                        "packed": true
                    }
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "Relation",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "id",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "uint32",
                    "name": "keys",
                    "id": 2,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "uint32",
                    "name": "vals",
                    "id": 3,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "optional",
                    "type": "Info",
                    "name": "info",
                    "id": 4,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "int32",
                    "name": "roles_sid",
                    "id": 8,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "sint64",
                    "name": "memids",
                    "id": 9,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "MemberType",
                    "name": "types",
                    "id": 10,
                    "options": {
                        "packed": true
                    }
                }
            ],
            "enums": [
                {
                    "name": "MemberType",
                    "values": [
                        {
                            "name": "NODE",
                            "id": 0
                        },
                        {
                            "name": "WAY",
                            "id": 1
                        },
                        {
                            "name": "RELATION",
                            "id": 2
                        }
                    ],
                    "options": {}
                }
            ],
            "messages": [],
            "options": {}
        }
    ],
    "enums": [],
    "imports": [],
    "options": {
        "optimize_for": "LITE_RUNTIME",
        "java_package": "org.openstreetmap.osmosis.osmbinary"
    },
    "services": []
}).build("OSMPBF");

},{"protobufjs":10}],10:[function(_dereq_,module,exports){
/*
 ProtoBuf.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
 Released under the Apache License, Version 2.0
 see: https://github.com/dcodeIO/ProtoBuf.js for details
*/
(function(q){function r(p){var k={VERSION:"2.0.5",WIRE_TYPES:{}};k.WIRE_TYPES.VARINT=0;k.WIRE_TYPES.BITS64=1;k.WIRE_TYPES.LDELIM=2;k.WIRE_TYPES.STARTGROUP=3;k.WIRE_TYPES.ENDGROUP=4;k.WIRE_TYPES.BITS32=5;k.TYPES={int32:{name:"int32",wireType:k.WIRE_TYPES.VARINT},uint32:{name:"uint32",wireType:k.WIRE_TYPES.VARINT},sint32:{name:"sint32",wireType:k.WIRE_TYPES.VARINT},int64:{name:"int64",wireType:k.WIRE_TYPES.VARINT},uint64:{name:"uint64",wireType:k.WIRE_TYPES.VARINT},sint64:{name:"sint64",wireType:k.WIRE_TYPES.VARINT},
bool:{name:"bool",wireType:k.WIRE_TYPES.VARINT},"double":{name:"double",wireType:k.WIRE_TYPES.BITS64},string:{name:"string",wireType:k.WIRE_TYPES.LDELIM},bytes:{name:"bytes",wireType:k.WIRE_TYPES.LDELIM},fixed32:{name:"fixed32",wireType:k.WIRE_TYPES.BITS32},sfixed32:{name:"sfixed32",wireType:k.WIRE_TYPES.BITS32},fixed64:{name:"fixed64",wireType:k.WIRE_TYPES.BITS64},sfixed64:{name:"sfixed64",wireType:k.WIRE_TYPES.BITS64},"float":{name:"float",wireType:k.WIRE_TYPES.BITS32},"enum":{name:"enum",wireType:k.WIRE_TYPES.VARINT},
message:{name:"message",wireType:k.WIRE_TYPES.LDELIM}};k.Long=p.Long;k.convertFieldsToCamelCase=!1;k.Util=function(){Object.create||(Object.create=function(c){function m(){}if(1<arguments.length)throw Error("Object.create implementation only accepts the first parameter.");m.prototype=c;return new m});var c={};c.IS_NODE=("undefined"===typeof window||!window.window)&&"function"===typeof _dereq_&&"undefined"!==typeof process&&"function"===typeof process.nextTick;c.XHR=function(){for(var c=[function(){return new XMLHttpRequest},
function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new ActiveXObject("Msxml3.XMLHTTP")},function(){return new ActiveXObject("Microsoft.XMLHTTP")}],m=null,l=0;l<c.length;l++){try{m=c[l]()}catch(a){continue}break}if(!m)throw Error("XMLHttpRequest is not supported");return m};c.fetch=function(h,m){m&&"function"!=typeof m&&(m=null);if(c.IS_NODE)if(m)_dereq_("fs").readFile(h,function(a,c){a?m(null):m(""+c)});else try{return _dereq_("fs").readFileSync(h)}catch(l){return null}else{var a=
c.XHR();a.open("GET",h,m?!0:!1);a.setRequestHeader("Accept","text/plain");"function"===typeof a.overrideMimeType&&a.overrideMimeType("text/plain");if(m)a.onreadystatechange=function(){4==a.readyState&&(200==a.status||0==a.status&&"string"===typeof a.responseText?m(a.responseText):m(null))},4!=a.readyState&&a.send(null);else return a.send(null),200==a.status||0==a.status&&"string"===typeof a.responseText?a.responseText:null}};c.isArray=function(c){return c?c instanceof Array?!0:Array.isArray?Array.isArray(c):
"[object Array]"===Object.prototype.toString.call(c):!1};return c}();k.Lang={OPEN:"{",CLOSE:"}",OPTOPEN:"[",OPTCLOSE:"]",OPTEND:",",EQUAL:"=",END:";",STRINGOPEN:'"',STRINGCLOSE:'"',COPTOPEN:"(",COPTCLOSE:")",DELIM:/[\s\{\}=;\[\],"\(\)]/g,KEYWORD:/^(?:package|option|import|message|enum|extend|service|syntax|extensions)$/,RULE:/^(?:required|optional|repeated)$/,TYPE:/^(?:double|float|int32|uint32|sint32|int64|uint64|sint64|fixed32|sfixed32|fixed64|sfixed64|bool|string|bytes)$/,NAME:/^[a-zA-Z][a-zA-Z_0-9]*$/,
OPTNAME:/^(?:[a-zA-Z][a-zA-Z_0-9]*|\([a-zA-Z][a-zA-Z_0-9]*\))$/,TYPEDEF:/^[a-zA-Z][a-zA-Z_0-9]*$/,TYPEREF:/^(?:\.?[a-zA-Z][a-zA-Z_0-9]*)+$/,FQTYPEREF:/^(?:\.[a-zA-Z][a-zA-Z_0-9]*)+$/,NUMBER:/^-?(?:[1-9][0-9]*|0|0x[0-9a-fA-F]+|0[0-7]+|[0-9]*\.[0-9]+)$/,NUMBER_DEC:/^(?:[1-9][0-9]*|0)$/,NUMBER_HEX:/^0x[0-9a-fA-F]+$/,NUMBER_OCT:/^0[0-7]+$/,NUMBER_FLT:/^[0-9]*\.[0-9]+$/,ID:/^(?:[1-9][0-9]*|0|0x[0-9a-fA-F]+|0[0-7]+)$/,NEGID:/^\-?(?:[1-9][0-9]*|0|0x[0-9a-fA-F]+|0[0-7]+)$/,WHITESPACE:/\s/,STRING:/"([^"\\]*(\\.[^"\\]*)*)"/g,
BOOL:/^(?:true|false)$/i,ID_MIN:1,ID_MAX:536870911};k.Reflect=function(c){var h={},m=function(b,f){this.parent=b;this.name=f};m.prototype.fqn=function(){var b=this.name,f=this;do{f=f.parent;if(null==f)break;b=f.name+"."+b}while(1);return b};m.prototype.toString=function(b){var f=this.fqn();b&&(this instanceof a?f="Message "+f:this instanceof a.Field?f="Message.Field "+f:this instanceof d?f="Enum "+f:this instanceof d.Value?f="Enum.Value "+f:this instanceof g?f="Service "+f:this instanceof g.Method?
f=this instanceof g.RPCMethod?"Service.RPCMethod "+f:"Service.Method "+f:this instanceof l&&(f="Namespace "+f));return f};m.prototype.build=function(){throw Error(this.toString(!0)+" cannot be built directly");};h.T=m;var l=function(b,f,a){m.call(this,b,f);this.children=[];this.options=a||{}};l.prototype=Object.create(m.prototype);l.prototype.getChildren=function(b){b=b||null;if(null==b)return this.children.slice();for(var f=[],a=0;a<this.children.length;a++)this.children[a]instanceof b&&f.push(this.children[a]);
return f};l.prototype.addChild=function(b){var f;if(f=this.getChild(b.name))if(f instanceof a.Field&&f.name!==f.originalName&&!this.hasChild(f.originalName))f.name=f.originalName;else if(b instanceof a.Field&&b.name!==b.originalName&&!this.hasChild(b.originalName))b.name=b.originalName;else throw Error("Duplicate name in namespace "+this.toString(!0)+": "+b.name);this.children.push(b)};l.prototype.hasChild=function(b){var f;if("number"==typeof b)for(f=0;f<this.children.length;f++){if("undefined"!==
typeof this.children[f].id&&this.children[f].id==b)return!0}else for(f=0;f<this.children.length;f++)if("undefined"!==typeof this.children[f].name&&this.children[f].name==b)return!0;return!1};l.prototype.getChild=function(b){var f;if("number"==typeof b)for(f=0;f<this.children.length;f++){if("undefined"!==typeof this.children[f].id&&this.children[f].id==b)return this.children[f]}else for(f=0;f<this.children.length;f++)if("undefined"!==typeof this.children[f].name&&this.children[f].name==b)return this.children[f];
return null};l.prototype.resolve=function(b,f){var a=b.split("."),c=this,d=0;if(""==a[d]){for(;null!=c.parent;)c=c.parent;d++}do{do{c=c.getChild(a[d]);if(!(c&&c instanceof h.T)||f&&c instanceof h.Message.Field){c=null;break}d++}while(d<a.length);if(null!=c)break;if(null!==this.parent)return this.parent.resolve(b,f)}while(null!=c);return c};l.prototype.build=function(){for(var b={},f=this.getChildren(),a,c=0;c<f.length;c++)a=f[c],a instanceof l&&(b[a.name]=a.build());Object.defineProperty&&Object.defineProperty(b,
"$options",{value:this.buildOpt(),enumerable:!1,configurable:!1,writable:!1});return b};l.prototype.buildOpt=function(){for(var b={},f=Object.keys(this.options),a=0;a<f.length;a++)b[f[a]]=this.options[f[a]];return b};l.prototype.getOption=function(b){return"undefined"==typeof b?this.options:"undefined"!=typeof this.options[b]?this.options[b]:null};h.Namespace=l;var a=function(b,f,a){l.call(this,b,f,a);this.extensions=[c.Lang.ID_MIN,c.Lang.ID_MAX];this.clazz=null};a.prototype=Object.create(l.prototype);
a.prototype.build=function(b){if(this.clazz&&!b)return this.clazz;b=function(b,f){var a=f.getChildren(h.Message.Field),c=function(f){b.Builder.Message.call(this);var c,d;for(c=0;c<a.length;c++)d=a[c],this[d.name]=d.repeated?[]:null;for(c=0;c<a.length;c++)if(d=a[c],"undefined"!=typeof d.options["default"])try{this.set(d.name,d.options["default"])}catch(n){throw Error("[INTERNAL] "+n);}if(1!=arguments.length||"object"!=typeof f||"function"==typeof f.encode||b.Util.isArray(f)||f instanceof p||f instanceof
ArrayBuffer||b.Long&&f instanceof b.Long)for(c=0;c<arguments.length;c++)c<a.length&&this.set(a[c].name,arguments[c]);else for(d=Object.keys(f),c=0;c<d.length;c++)this.set(d[c],f[d[c]])};c.prototype=Object.create(b.Builder.Message.prototype);c.prototype.add=function(a,c){var d=f.getChild(a);if(!d)throw Error(this+"#"+a+" is undefined");if(!(d instanceof b.Reflect.Message.Field))throw Error(this+"#"+a+" is not a field: "+d.toString(!0));if(!d.repeated)throw Error(this+"#"+a+" is not a repeated field");
null===this[d.name]&&(this[d.name]=[]);this[d.name].push(d.verifyValue(c,!0))};c.prototype.set=function(a,c){var d=f.getChild(a);if(!d)throw Error(this+"#"+a+" is not a field: undefined");if(!(d instanceof b.Reflect.Message.Field))throw Error(this+"#"+a+" is not a field: "+d.toString(!0));this[d.name]=d.verifyValue(c)};c.prototype.get=function(a){var c=f.getChild(a);if(!(c&&c instanceof b.Reflect.Message.Field))throw Error(this+"#"+a+" is not a field: undefined");if(!(c instanceof b.Reflect.Message.Field))throw Error(this+
"#"+a+" is not a field: "+c.toString(!0));return this[c.name]};for(var d=0;d<a.length;d++)(function(b){var a=b.originalName.replace(/(_[a-zA-Z])/g,function(b){return b.toUpperCase().replace("_","")}),a=a.substring(0,1).toUpperCase()+a.substring(1),d=b.originalName.replace(/([A-Z])/g,function(b){return"_"+b});f.hasChild("set"+a)||(c.prototype["set"+a]=function(a){this.set(b.name,a)});f.hasChild("set_"+d)||(c.prototype["set_"+d]=function(a){this.set(b.name,a)});f.hasChild("get"+a)||(c.prototype["get"+
a]=function(){return this.get(b.name)});f.hasChild("get_"+d)||(c.prototype["get_"+d]=function(){return this.get(b.name)})})(a[d]);c.prototype.encode=function(b){b=b||new p;var a=b.littleEndian;try{return f.encode(this,b.LE()).flip().LE(a)}catch(c){throw b.LE(a),c;}};c.prototype.encodeAB=function(){try{return this.encode().toArrayBuffer()}catch(b){throw b.encoded&&(b.encoded=b.encoded.toArrayBuffer()),b;}};c.prototype.toArrayBuffer=c.prototype.encodeAB;c.prototype.encodeNB=function(){try{return this.encode().toBuffer()}catch(b){throw b.encoded&&
(b.encoded=b.encoded.toBuffer()),b;}};c.prototype.toBuffer=c.prototype.encodeNB;c.prototype.encode64=function(){try{return this.encode().toBase64()}catch(b){throw b.encoded&&(b.encoded=b.encoded.toBase64()),b;}};c.prototype.toBase64=c.prototype.encode64;c.prototype.encodeHex=function(){try{return this.encode().toHex()}catch(b){throw b.encoded&&(b.encoded=b.encoded.toHex()),b;}};c.prototype.toHex=c.prototype.encodeHex;c.decode=function(b,a){if(null===b)throw Error("buffer must not be null");"string"===
typeof b&&(b=p.wrap(b,a?a:"base64"));b=b instanceof p?b:p.wrap(b);var c=b.littleEndian;try{var d=f.decode(b.LE());b.LE(c);return d}catch(n){throw b.LE(c),n;}};c.decode64=function(b){return c.decode(b,"base64")};c.decodeHex=function(b){return c.decode(b,"hex")};c.prototype.toString=function(){return f.toString()};Object.defineProperty&&Object.defineProperty(c,"$options",{value:f.buildOpt(),enumerable:!1,configurable:!1,writable:!1});return c}(c,this);for(var f=this.getChildren(),n=0;n<f.length;n++)if(f[n]instanceof
d)b[f[n].name]=f[n].build();else if(f[n]instanceof a)b[f[n].name]=f[n].build();else if(!(f[n]instanceof a.Field))throw Error("Illegal reflect child of "+this.toString(!0)+": "+f[n].toString(!0));return this.clazz=b};a.prototype.encode=function(b,f){for(var c=this.getChildren(a.Field),d=null,e=0;e<c.length;e++){var h=b.get(c[e].name);c[e].required&&null===h?null===d&&(d=c[e]):c[e].encode(h,f)}if(null!==d)throw c=Error("Missing at least one required field for "+this.toString(!0)+": "+d),c.encoded=f,
c;return f};a.prototype.decode=function(b,a){a="number"===typeof a?a:-1;for(var d=b.offset,e=new this.clazz;b.offset<d+a||-1==a&&0<b.remaining();){var h=b.readVarint32(),g=h&7,h=h>>3,l=this.getChild(h);if(l)l.repeated&&!l.options.packed?e.add(l.name,l.decode(g,b)):e.set(l.name,l.decode(g,b));else switch(g){case c.WIRE_TYPES.VARINT:b.readVarint32();break;case c.WIRE_TYPES.BITS32:b.offset+=4;break;case c.WIRE_TYPES.BITS64:b.offset+=8;break;case c.WIRE_TYPES.LDELIM:g=b.readVarint32();b.offset+=g;break;
default:throw Error("Illegal wire type of unknown field "+h+" in "+this.toString(!0)+"#decode: "+g);}}d=this.getChildren(c.Reflect.Field);for(g=0;g<d.length;g++)if(d[g].required&&null===e[d[g].name])throw d=Error("Missing at least one required field for "+this.toString(!0)+": "+d[g].name),d.decoded=e,d;return e};h.Message=a;var e=function(b,a,d,e,g,h){m.call(this,b,e);this.required="required"==a;this.repeated="repeated"==a;this.type=d;this.resolvedType=null;this.id=g;this.options=h||{};this.originalName=
this.name;c.convertFieldsToCamelCase&&(this.name=this.name.replace(/_([a-zA-Z])/g,function(b,a){return a.toUpperCase()}))};e.prototype=Object.create(m.prototype);e.prototype.verifyValue=function(b,a){a=a||!1;if(null===b){if(this.required)throw Error("Illegal value for "+this.toString(!0)+": "+b+" (required)");return null}var e;if(this.repeated&&!a){c.Util.isArray(b)||(b=[b]);var g=[];for(e=0;e<b.length;e++)g.push(this.verifyValue(b[e],!0));return g}if(!this.repeated&&c.Util.isArray(b))throw Error("Illegal value for "+
this.toString(!0)+": "+b+" (no array expected)");if(this.type==c.TYPES.int32||this.type==c.TYPES.sint32||this.type==c.TYPES.sfixed32)return isNaN(e=parseInt(b,10))?e:e|0;if(this.type==c.TYPES.uint32||this.type==c.TYPES.fixed32)return isNaN(e=parseInt(b,10))?e:e>>>0;if(c.Long){if(this.type==c.TYPES.int64||this.type==c.TYPES.sint64||this.type==c.TYPES.sfixed64)return"object"==typeof b&&b instanceof c.Long?b.unsigned?b.toSigned():b:c.Long.fromNumber(b,!1);if(this.type==c.TYPES.uint64||this.type==c.TYPES.fixed64)return"object"==
typeof b&&b instanceof c.Long?b.unsigned?b:b.toUnsigned():c.Long.fromNumber(b,!0)}if(this.type==c.TYPES.bool)return"string"===typeof b?"true"===b:!!b;if(this.type==c.TYPES["float"]||this.type==c.TYPES["double"])return parseFloat(b);if(this.type==c.TYPES.string)return""+b;if(this.type==c.TYPES.bytes)return b&&b instanceof p?b:p.wrap(b);if(this.type==c.TYPES["enum"]){g=this.resolvedType.getChildren(d.Value);for(e=0;e<g.length;e++)if(g[e].name==b||g[e].id==b)return g[e].id;throw Error("Illegal value for "+
this.toString(!0)+": "+b+" (not a valid enum value)");}if(this.type==c.TYPES.message){if("object"!==typeof b)throw Error("Illegal value for "+this.toString(!0)+": "+b+" (object expected)");return b instanceof this.resolvedType.clazz?b:new this.resolvedType.clazz(b)}throw Error("[INTERNAL] Illegal value for "+this.toString(!0)+": "+b+" (undefined type "+this.type+")");};e.prototype.encode=function(b,a){b=this.verifyValue(b);if(null==this.type||"object"!=typeof this.type)throw Error("[INTERNAL] Unresolved type in "+
this.toString(!0)+": "+this.type);if(null===b||this.repeated&&0==b.length)return a;try{if(this.repeated){var d;if(this.options.packed){a.writeVarint32(this.id<<3|c.WIRE_TYPES.LDELIM);a.ensureCapacity(a.offset+=1);var e=a.offset;for(d=0;d<b.length;d++)this.encodeValue(b[d],a);var g=a.offset-e,h=p.calculateVarint32(g);if(1<h){var l=a.slice(e,a.offset),e=e+(h-1);a.offset=e;a.append(l)}a.writeVarint32(g,e-h)}else for(d=0;d<b.length;d++)a.writeVarint32(this.id<<3|this.type.wireType),this.encodeValue(b[d],
a)}else a.writeVarint32(this.id<<3|this.type.wireType),this.encodeValue(b,a)}catch(m){throw Error("Illegal value for "+this.toString(!0)+": "+b+" ("+m+")");}return a};e.prototype.encodeValue=function(b,a){if(null!==b){if(this.type==c.TYPES.int32||this.type==c.TYPES.uint32)a.writeVarint32(b);else if(this.type==c.TYPES.sint32)a.writeZigZagVarint32(b);else if(this.type==c.TYPES.fixed32)a.writeUint32(b);else if(this.type==c.TYPES.sfixed32)a.writeInt32(b);else if(this.type==c.TYPES.int64||this.type==c.TYPES.uint64)a.writeVarint64(b);
else if(this.type==c.TYPES.sint64)a.writeZigZagVarint64(b);else if(this.type==c.TYPES.fixed64)a.writeUint64(b);else if(this.type==c.TYPES.sfixed64)a.writeInt64(b);else if(this.type==c.TYPES.bool)"string"===typeof b?a.writeVarint32("false"===b.toLowerCase()?0:!!b):a.writeVarint32(b?1:0);else if(this.type==c.TYPES["enum"])a.writeVarint32(b);else if(this.type==c.TYPES["float"])a.writeFloat32(b);else if(this.type==c.TYPES["double"])a.writeFloat64(b);else if(this.type==c.TYPES.string)a.writeVString(b);
else if(this.type==c.TYPES.bytes)b.offset>b.length&&(a=a.clone().flip()),a.writeVarint32(b.remaining()),a.append(b);else if(this.type==c.TYPES.message){var d=(new p).LE();this.resolvedType.encode(b,d);a.writeVarint32(d.offset);a.append(d.flip())}else throw Error("[INTERNAL] Illegal value to encode in "+this.toString(!0)+": "+b+" (unknown type)");return a}};e.prototype.decode=function(b,a,d){if(b!=this.type.wireType&&(d||b!=c.WIRE_TYPES.LDELIM||!this.repeated))throw Error("Illegal wire type for field "+
this.toString(!0)+": "+b+" ("+this.type.wireType+" expected)");if(b==c.WIRE_TYPES.LDELIM&&this.repeated&&this.options.packed&&!d){b=a.readVarint32();b=a.offset+b;for(d=[];a.offset<b;)d.push(this.decode(this.type.wireType,a,!0));return d}if(this.type==c.TYPES.int32)return a.readVarint32()|0;if(this.type==c.TYPES.uint32)return a.readVarint32()>>>0;if(this.type==c.TYPES.sint32)return a.readZigZagVarint32()|0;if(this.type==c.TYPES.fixed32)return a.readUint32()>>>0;if(this.type==c.TYPES.sfixed32)return a.readInt32()|
0;if(this.type==c.TYPES.int64)return a.readVarint64();if(this.type==c.TYPES.uint64)return a.readVarint64().toUnsigned();if(this.type==c.TYPES.sint64)return a.readZigZagVarint64();if(this.type==c.TYPES.fixed64)return a.readUint64();if(this.type==c.TYPES.sfixed64)return a.readInt64();if(this.type==c.TYPES.bool)return!!a.readVarint32();if(this.type==c.TYPES["enum"])return a.readVarint32();if(this.type==c.TYPES["float"])return a.readFloat();if(this.type==c.TYPES["double"])return a.readDouble();if(this.type==
c.TYPES.string)return a.readVString();if(this.type==c.TYPES.bytes){b=a.readVarint32();if(a.remaining()<b)throw Error("Illegal number of bytes for "+this.toString(!0)+": "+b+" required but got only "+a.remaining());d=a.clone();d.length=d.offset+b;a.offset+=b;return d}if(this.type==c.TYPES.message)return b=a.readVarint32(),this.resolvedType.decode(a,b);throw Error("[INTERNAL] Illegal wire type for "+this.toString(!0)+": "+b);};h.Message.Field=e;var d=function(a,c,d){l.call(this,a,c,d);this.object=null};
d.prototype=Object.create(l.prototype);d.prototype.build=function(){for(var a={},c=this.getChildren(d.Value),e=0;e<c.length;e++)a[c[e].name]=c[e].id;Object.defineProperty&&Object.defineProperty(a,"$options",{value:this.buildOpt(),enumerable:!1,configurable:!1,writable:!1});return this.object=a};h.Enum=d;e=function(a,c,d){m.call(this,a,c);this.id=d};e.prototype=Object.create(m.prototype);h.Enum.Value=e;var g=function(a,c,d){l.call(this,a,c,d);this.clazz=null};g.prototype=Object.create(l.prototype);
g.prototype.build=function(a){return this.clazz&&!a?this.clazz:this.clazz=function(a,b){var c=function(b){a.Builder.Service.call(this);this.rpcImpl=b||function(a,b,c){setTimeout(c.bind(this,Error("Not implemented, see: https://github.com/dcodeIO/ProtoBuf.js/wiki/Services")),0)}};c.prototype=Object.create(a.Builder.Service.prototype);Object.defineProperty&&(Object.defineProperty(c,"$options",{value:b.buildOpt(),enumerable:!1,configurable:!1,writable:!1}),Object.defineProperty(c.prototype,"$options",
{value:c.$options,enumerable:!1,configurable:!1,writable:!1}));for(var d=b.getChildren(h.Service.RPCMethod),e=0;e<d.length;e++)(function(a){c.prototype[a.name]=function(c,d){try{c&&c instanceof a.resolvedRequestType.clazz||setTimeout(d.bind(this,Error("Illegal request type provided to service method "+b.name+"#"+a.name))),this.rpcImpl(a.fqn(),c,function(c,e){if(c)d(c);else{try{e=a.resolvedResponseType.clazz.decode(e)}catch(f){}e&&e instanceof a.resolvedResponseType.clazz?d(null,e):d(Error("Illegal response type received in service method "+
b.name+"#"+a.name))}})}catch(e){setTimeout(d.bind(this,e),0)}};c[a.name]=function(b,d,e){(new c(b))[a.name](d,e)};Object.defineProperty&&(Object.defineProperty(c[a.name],"$options",{value:a.buildOpt(),enumerable:!1,configurable:!1,writable:!1}),Object.defineProperty(c.prototype[a.name],"$options",{value:c[a.name].$options,enumerable:!1,configurable:!1,writable:!1}))})(d[e]);return c}(c,this)};h.Service=g;var k=function(a,c,d){m.call(this,a,c);this.options=d||{}};k.prototype=Object.create(m.prototype);
k.prototype.buildOpt=l.prototype.buildOpt;h.Service.Method=k;e=function(a,c,d,e,g){k.call(this,a,c,g);this.requestName=d;this.responseName=e;this.resolvedResponseType=this.resolvedRequestType=null};e.prototype=Object.create(k.prototype);h.Service.RPCMethod=e;return h}(k);k.Builder=function(c,h,m){var l=function(){this.ptr=this.ns=new m.Namespace(null,"");this.resolved=!1;this.result=null;this.files={};this.importRoot=null};l.prototype.reset=function(){this.ptr=this.ns};l.prototype.define=function(a,
c){if("string"!==typeof a||!h.TYPEREF.test(a))throw Error("Illegal package name: "+a);var d=a.split("."),g;for(g=0;g<d.length;g++)if(!h.NAME.test(d[g]))throw Error("Illegal package name: "+d[g]);for(g=0;g<d.length;g++)this.ptr.hasChild(d[g])||this.ptr.addChild(new m.Namespace(this.ptr,d[g],c)),this.ptr=this.ptr.getChild(d[g]);return this};l.isValidMessage=function(a){if("string"!==typeof a.name||!h.NAME.test(a.name)||"undefined"!==typeof a.values||"undefined"!==typeof a.rpc)return!1;var e;if("undefined"!==
typeof a.fields){if(!c.Util.isArray(a.fields))return!1;var d=[],g;for(e=0;e<a.fields.length;e++){if(!l.isValidMessageField(a.fields[e]))return!1;g=parseInt(a.id,10);if(0<=d.indexOf(g))return!1;d.push(g)}}if("undefined"!==typeof a.enums){if(!c.Util.isArray(a.enums))return!1;for(e=0;e<a.enums.length;e++)if(!l.isValidEnum(a.enums[e]))return!1}if("undefined"!==typeof a.messages){if(!c.Util.isArray(a.messages))return!1;for(e=0;e<a.messages.length;e++)if(!l.isValidMessage(a.messages[e])&&!l.isValidExtend(a.messages[e]))return!1}return"undefined"===
typeof a.extensions||c.Util.isArray(a.extensions)&&2===a.extensions.length&&"number"===typeof a.extensions[0]&&"number"===typeof a.extensions[1]?!0:!1};l.isValidMessageField=function(a){if("string"!==typeof a.rule||"string"!==typeof a.name||"string"!==typeof a.type||"undefined"===typeof a.id||!(h.RULE.test(a.rule)&&h.NAME.test(a.name)&&h.TYPEREF.test(a.type)&&h.ID.test(""+a.id)))return!1;if("undefined"!=typeof a.options){if("object"!=typeof a.options)return!1;for(var c=Object.keys(a.options),d=0;d<
c.length;d++)if(!h.OPTNAME.test(c[d])||"string"!==typeof a.options[c[d]]&&"number"!==typeof a.options[c[d]]&&"boolean"!==typeof a.options[c[d]])return!1}return!0};l.isValidEnum=function(a){if("string"!==typeof a.name||!h.NAME.test(a.name)||"undefined"===typeof a.values||!c.Util.isArray(a.values)||0==a.values.length)return!1;for(var e=0;e<a.values.length;e++)if("object"!=typeof a.values[e]||"string"!==typeof a.values[e].name||"undefined"===typeof a.values[e].id||!h.NAME.test(a.values[e].name)||!h.NEGID.test(""+
a.values[e].id))return!1;return!0};l.prototype.create=function(a){if(a&&(c.Util.isArray(a)||(a=[a]),0!=a.length)){var e=[],d,g,k,b,f;for(e.push(a);0<e.length;){a=e.pop();if(c.Util.isArray(a))for(;0<a.length;)if(d=a.shift(),l.isValidMessage(d)){g=new m.Message(this.ptr,d.name,d.options);if(d.fields&&0<d.fields.length)for(b=0;b<d.fields.length;b++){if(g.hasChild(d.fields[b].id))throw Error("Duplicate field id in message "+g.name+": "+d.fields[b].id);if(d.fields[b].options)for(k=Object.keys(d.fields[b].options),
f=0;f<k.length;f++){if(!h.OPTNAME.test(k[f]))throw Error("Illegal field option name in message "+g.name+"#"+d.fields[b].name+": "+k[f]);if("string"!==typeof d.fields[b].options[k[f]]&&"number"!==typeof d.fields[b].options[k[f]]&&"boolean"!==typeof d.fields[b].options[k[f]])throw Error("Illegal field option value in message "+g.name+"#"+d.fields[b].name+"#"+k[f]+": "+d.fields[b].options[k[f]]);}g.addChild(new m.Message.Field(g,d.fields[b].rule,d.fields[b].type,d.fields[b].name,d.fields[b].id,d.fields[b].options))}k=
[];if("undefined"!==typeof d.enums&&0<d.enums.length)for(b=0;b<d.enums.length;b++)k.push(d.enums[b]);if(d.messages&&0<d.messages.length)for(b=0;b<d.messages.length;b++)k.push(d.messages[b]);d.extensions&&(g.extensions=d.extensions,g.extensions[0]<c.Lang.ID_MIN&&(g.extensions[0]=c.Lang.ID_MIN),g.extensions[1]>c.Lang.ID_MAX&&(g.extensions[1]=c.Lang.ID_MAX));this.ptr.addChild(g);0<k.length&&(e.push(a),a=k,this.ptr=g)}else if(l.isValidEnum(d)){g=new m.Enum(this.ptr,d.name,d.options);for(b=0;b<d.values.length;b++)g.addChild(new m.Enum.Value(g,
d.values[b].name,d.values[b].id));this.ptr.addChild(g)}else if(l.isValidService(d)){g=new m.Service(this.ptr,d.name,d.options);for(b in d.rpc)d.rpc.hasOwnProperty(b)&&g.addChild(new m.Service.RPCMethod(g,b,d.rpc[b].request,d.rpc[b].response,d.rpc[b].options));this.ptr.addChild(g)}else if(l.isValidExtend(d))if(g=this.ptr.resolve(d.ref))for(b=0;b<d.fields.length;b++){if(g.hasChild(d.fields[b].id))throw Error("Duplicate extended field id in message "+g.name+": "+d.fields[b].id);if(d.fields[b].id<g.extensions[0]||
d.fields[b].id>g.extensions[1])throw Error("Illegal extended field id in message "+g.name+": "+d.fields[b].id+" ("+g.extensions.join(" to ")+" expected)");g.addChild(new m.Message.Field(g,d.fields[b].rule,d.fields[b].type,d.fields[b].name,d.fields[b].id,d.fields[b].options))}else{if(!/\.?google\.protobuf\./.test(d.ref))throw Error("Extended message "+d.ref+" is not defined");}else throw Error("Not a valid message, enum, service or extend definition: "+JSON.stringify(d));else throw Error("Not a valid namespace definition: "+
JSON.stringify(a));this.ptr=this.ptr.parent}this.resolved=!1;this.result=null;return this}};l.isValidImport=function(a){return!/google\/protobuf\//.test(a)};l.prototype["import"]=function(a,e){if("string"===typeof e){c.Util.IS_NODE&&(e=_dereq_("path").resolve(e));if(this.files[e])return this.reset(),this;this.files[e]=!0}if(a.imports&&0<a.imports.length){var d,g="/",h=!1;if("object"===typeof e){if(this.importRoot=e.root,h=!0,d=this.importRoot,e=e.file,0<=d.indexOf("\\")||0<=e.indexOf("\\"))g="\\"}else"string"===
typeof e?this.importRoot?d=this.importRoot:0<=e.indexOf("/")?(d=e.replace(/\/[^\/]*$/,""),""===d&&(d="/")):0<=e.indexOf("\\")?(d=e.replace(/\\[^\\]*$/,""),g="\\"):d=".":d=null;for(var b=0;b<a.imports.length;b++)if("string"===typeof a.imports[b]){if(!d)throw Error("Cannot determine import root: File name is unknown");var f=d+g+a.imports[b];if(l.isValidImport(f)){/\.proto$/i.test(f)&&!c.DotProto&&(f=f.replace(/\.proto$/,".json"));var k=c.Util.fetch(f);if(null===k)throw Error("Failed to import '"+f+
"' in '"+e+"': File not found");if(/\.json$/i.test(f))this["import"](JSON.parse(k+""),f);else this["import"]((new c.DotProto.Parser(k+"")).parse(),f)}}else if(e)if(/\.(\w+)$/.test(e))this["import"](a.imports[b],e.replace(/^(.+)\.(\w+)$/,function(a,c,d){return c+"_import"+b+"."+d}));else this["import"](a.imports[b],e+"_import"+b);else this["import"](a.imports[b]);h&&(this.importRoot=null)}a.messages&&(a["package"]&&this.define(a["package"],a.options),this.create(a.messages),this.reset());a.enums&&
(a["package"]&&this.define(a["package"],a.options),this.create(a.enums),this.reset());a.services&&(a["package"]&&this.define(a["package"],a.options),this.create(a.services),this.reset());a["extends"]&&(a["package"]&&this.define(a["package"],a.options),this.create(a["extends"]),this.reset());return this};l.isValidService=function(a){return"string"===typeof a.name&&h.NAME.test(a.name)&&"object"===typeof a.rpc?!0:!1};l.isValidExtend=function(a){if("string"!==typeof a.ref||!h.TYPEREF.test(a.name))return!1;
var e;if("undefined"!==typeof a.fields){if(!c.Util.isArray(a.fields))return!1;var d=[],g;for(e=0;e<a.fields.length;e++){if(!l.isValidMessageField(a.fields[e]))return!1;g=parseInt(a.id,10);if(0<=d.indexOf(g))return!1;d.push(g)}}return!0};l.prototype.resolveAll=function(){var a;if(null!=this.ptr&&"object"!==typeof this.ptr.type){if(this.ptr instanceof m.Namespace){a=this.ptr.getChildren();for(var e=0;e<a.length;e++)this.ptr=a[e],this.resolveAll()}else if(this.ptr instanceof m.Message.Field)if(h.TYPE.test(this.ptr.type))this.ptr.type=
c.TYPES[this.ptr.type];else{if(!h.TYPEREF.test(this.ptr.type))throw Error("Illegal type reference in "+this.ptr.toString(!0)+": "+this.ptr.type);a=this.ptr.parent.resolve(this.ptr.type,!0);if(!a)throw Error("Unresolvable type reference in "+this.ptr.toString(!0)+": "+this.ptr.type);this.ptr.resolvedType=a;if(a instanceof m.Enum)this.ptr.type=c.TYPES["enum"];else if(a instanceof m.Message)this.ptr.type=c.TYPES.message;else throw Error("Illegal type reference in "+this.ptr.toString(!0)+": "+this.ptr.type);
}else if(!(this.ptr instanceof c.Reflect.Enum.Value))if(this.ptr instanceof c.Reflect.Service.Method)if(this.ptr instanceof c.Reflect.Service.RPCMethod){a=this.ptr.parent.resolve(this.ptr.requestName);if(!(a&&a instanceof c.Reflect.Message))throw Error("Illegal request type reference in "+this.ptr.toString(!0)+": "+this.ptr.requestName);this.ptr.resolvedRequestType=a;a=this.ptr.parent.resolve(this.ptr.responseName);if(!(a&&a instanceof c.Reflect.Message))throw Error("Illegal response type reference in "+
this.ptr.toString(!0)+": "+this.ptr.responseName);this.ptr.resolvedResponseType=a}else throw Error("Illegal service method type in "+this.ptr.toString(!0));else throw Error("Illegal object type in namespace: "+typeof this.ptr+":"+this.ptr);this.reset()}};l.prototype.build=function(a){this.reset();this.resolved||(this.resolveAll(),this.resolved=!0,this.result=null);null==this.result&&(this.result=this.ns.build());if(a){a=a.split(".");for(var c=this.result,d=0;d<a.length;d++)if(c[a[d]])c=c[a[d]];else{c=
null;break}return c}return this.result};l.prototype.lookup=function(a){return a?this.ns.resolve(a):this.ns};l.prototype.toString=function(){return"Builder"};l.Message=function(){};l.Service=function(){};return l}(k,k.Lang,k.Reflect);k.newBuilder=function(c,h){var m=new k.Builder;"undefined"!==typeof c&&null!==c&&m.define(c,h);return m};k.loadJson=function(c,h,m){if("string"===typeof h||h&&"string"===typeof h.file&&"string"===typeof h.root)m=h,h=null;h&&"object"===typeof h||(h=k.newBuilder());"string"===
typeof c&&(c=JSON.parse(c));h["import"](c,m);h.resolveAll();h.build();return h};k.loadJsonFile=function(c,h,m){h&&"object"===typeof h?(m=h,h=null):h&&"function"===typeof h||(h=null);if(h)k.Util.fetch("object"===typeof c?c.root+"/"+c.file:c,function(a){try{h(k.loadJson(JSON.parse(a),m,c))}catch(e){h(e)}});else{var l=k.Util.fetch("object"===typeof c?c.root+"/"+c.file:c);return null!==l?k.loadJson(JSON.parse(l),m,c):null}};return k}"undefined"!=typeof module&&module.exports?module.exports=r(_dereq_("bytebuffer")):
"undefined"!=typeof define&&define.amd?define("ProtoBuf",["ByteBuffer"],r):(q.dcodeIO||(q.dcodeIO={}),q.dcodeIO.ProtoBuf=r(q.dcodeIO.ByteBuffer))})(this);

},{}],"BPteWg":[function(_dereq_,module,exports){
/*
 ByteBuffer.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
 Released under the Apache License, Version 2.0
 see: https://github.com/dcodeIO/ByteBuffer.js for details
*/
(function(n){function q(l){function c(a,b,d){a="undefined"!==typeof a?parseInt(a,10):c.DEFAULT_CAPACITY;1>a&&(a=c.DEFAULT_CAPACITY);this.array=d?null:new ArrayBuffer(a);this.view=d?null:new DataView(this.array);this.offset=0;this.markedOffset=-1;this.length=0;this.littleEndian="undefined"!=typeof b?!!b:!1}var p=null;if("function"===typeof _dereq_)try{var n=_dereq_("buffer"),p=n&&"function"===typeof n.Buffer&&"function"===typeof n.Buffer.isBuffer?n.Buffer:null}catch(q){}c.VERSION="2.3.1";c.DEFAULT_CAPACITY=
16;c.LITTLE_ENDIAN=!0;c.BIG_ENDIAN=!1;c.Long=l||null;c.isByteBuffer=function(a){return a&&(a instanceof c||"object"===typeof a&&(null===a.array||a.array instanceof ArrayBuffer)&&(null===a.view||a.view instanceof DataView)&&"number"===typeof a.offset&&"number"===typeof a.markedOffset&&"number"===typeof a.length&&"boolean"===typeof a.littleEndian)};c.allocate=function(a,b){return new c(a,b)};c.wrap=function(a,b,d){"boolean"===typeof b&&(d=b,b="utf8");if("string"===typeof a)switch(b){case "base64":return c.decode64(a,
d);case "hex":return c.decodeHex(a,d);case "binary":return c.decodeBinary(a,d);default:return(new c(c.DEFAULT_CAPACITY,d)).writeUTF8String(a).flip()}if(p&&p.isBuffer(a)){b=(new Uint8Array(a)).buffer;if(b===a){b=new ArrayBuffer(a.length);for(var e=new Uint8Array(b),f=0,g=a.length;f<g;++f)e[f]=a[f]}a=b}if(null===a||"object"!==typeof a)throw Error("Cannot wrap null or non-object");if(c.isByteBuffer(a))return c.prototype.clone.call(a);a.array?a=a.array:a.buffer&&(a=a.buffer);if(!(a instanceof ArrayBuffer))throw Error("Cannot wrap buffer of type "+
typeof a+", "+a.constructor.name);b=new c(0,d,!0);b.array=a;b.view=0<b.array.byteLength?new DataView(b.array):null;b.offset=0;b.length=a.byteLength;return b};c.prototype.LE=function(a){this.littleEndian="undefined"!==typeof a?!!a:!0;return this};c.prototype.BE=function(a){this.littleEndian="undefined"!==typeof a?!a:!1;return this};c.prototype.resize=function(a){if(1>a)return!1;null===this.array&&(this.array=new ArrayBuffer(a),this.view=new DataView(this.array));if(this.array.byteLength<a){var b=new Uint8Array(this.array);
a=new ArrayBuffer(a);(new Uint8Array(a)).set(b);this.array=a;this.view=new DataView(a)}return this};c.prototype.slice=function(a,b){if(null==this.array)throw Error(this+" cannot be sliced: Already destroyed");"undefined"===typeof a&&(a=this.offset);"undefined"===typeof b&&(b=this.length);if(b<=a){var d=b;b=a;a=d}if(0>a||a>this.array.byteLength||1>b||b>this.array.byteLength)throw Error(this+" cannot be sliced: Index out of bounds (0-"+this.array.byteLength+" -> "+a+"-"+b+")");d=this.clone();d.offset=
a;d.length=b;return d};c.prototype.ensureCapacity=function(a){return null===this.array?this.resize(a):this.array.byteLength<a?this.resize(2*this.array.byteLength>=a?2*this.array.byteLength:a):this};c.prototype.flip=function(){this.length=null==this.array?0:this.offset;this.offset=0;return this};c.prototype.mark=function(a){if(null==this.array)throw Error(this+" cannot be marked: Already destroyed");a="undefined"!==typeof a?parseInt(a,10):this.offset;if(0>a||a>this.array.byteLength)throw Error(this+
" cannot be marked: Offset to mark is less than 0 or bigger than the capacity ("+this.array.byteLength+"): "+a);this.markedOffset=a;return this};c.prototype.reset=function(){if(null===this.array)throw Error(this+" cannot be reset: Already destroyed");0<=this.markedOffset?(this.offset=this.markedOffset,this.markedOffset=-1):this.length=this.offset=0;return this};c.prototype.clone=function(){var a=new c(-1,this.littleEndian,!0);a.array=this.array;a.view=this.view;a.offset=this.offset;a.markedOffset=
this.markedOffset;a.length=this.length;return a};c.prototype.copy=function(){if(null==this.array)return this.clone();var a=new c(this.array.byteLength,this.littleEndian),b=new Uint8Array(this.array);(new Uint8Array(a.array)).set(b);a.offset=this.offset;a.markedOffset=this.markedOffset;a.length=this.length;return a};c.prototype.remaining=function(){return null===this.array?0:this.length-this.offset};c.prototype.capacity=function(){return null!=this.array?this.array.byteLength:0};c.prototype.compact=
function(){if(null==this.array)throw Error(this+" cannot be compacted: Already destroyed");this.offset>this.length&&this.flip();if(this.offset===this.length)return this.array=new ArrayBuffer(0),this.view=null,this;if(0===this.offset&&this.length===this.array.byteLength)return this;var a=new Uint8Array(this.array),b=new ArrayBuffer(this.length-this.offset);(new Uint8Array(b)).set(a.subarray(this.offset,this.length));this.array=b;this.markedOffset=this.markedOffset>=this.offset?this.markedOffset-this.offset:
-1;this.offset=0;this.length=this.array.byteLength;return this};c.prototype.destroy=function(){null!==this.array&&(this.view=this.array=null,this.offset=0,this.markedOffset=-1,this.length=0);return this};c.prototype.reverse=function(){if(null===this.array)throw Error(this+" cannot be reversed: Already destroyed");Array.prototype.reverse.call(new Uint8Array(this.array));var a=this.offset;this.offset=this.array.byteLength-this.length;this.markedOffset=-1;this.length=this.array.byteLength-a;this.view=
new DataView(this.array);return this};c.prototype.append=function(a,b){a instanceof c||(a=c.wrap(a));if(null===a.array)throw Error(a+" cannot be appended to "+this+": Already destroyed");var d=a.length-a.offset;if(0==d)return this;0>d&&(a=a.clone().flip(),d=a.length-a.offset);b="undefined"!==typeof b?b:(this.offset+=d)-d;this.ensureCapacity(b+d);d=new Uint8Array(a.array);(new Uint8Array(this.array)).set(d.subarray(a.offset,a.length),b);return this};c.prototype.prepend=function(a,b){a instanceof c||
(a=c.wrap(a));if(null===a.array)throw a+" cannot be prepended to "+this+": Already destroyed";var d=a.length-a.offset;if(0==d)return this;0>d&&(a=a.clone().flip(),d=a.length-a.offset);var e="undefined"===typeof b;b="undefined"!==typeof b?b:this.offset;var f=d-b;0<f?(this.ensureCapacity(this.length+f),this.append(this,d),this.offset+=f,this.length+=f,this.append(a,0)):this.append(a,b-d);e&&(this.offset-=d);return this};c.prototype.writeInt8=function(a,b){b="undefined"!=typeof b?b:(this.offset+=1)-
1;this.ensureCapacity(b+1);this.view.setInt8(b,a);return this};c.prototype.readInt8=function(a){a="undefined"!==typeof a?a:(this.offset+=1)-1;if(a>=this.array.byteLength)throw Error("Cannot read int8 from "+this+" at "+a+": Capacity overflow");return this.view.getInt8(a)};c.prototype.writeByte=c.prototype.writeInt8;c.prototype.readByte=c.prototype.readInt8;c.prototype.writeUint8=function(a,b){b="undefined"!==typeof b?b:(this.offset+=1)-1;this.ensureCapacity(b+1);this.view.setUint8(b,a);return this};
c.prototype.readUint8=function(a){a="undefined"!==typeof a?a:(this.offset+=1)-1;if(a+1>this.array.byteLength)throw Error("Cannot read uint8 from "+this+" at "+a+": Capacity overflow");return this.view.getUint8(a)};c.prototype.writeInt16=function(a,b){b="undefined"!==typeof b?b:(this.offset+=2)-2;this.ensureCapacity(b+2);this.view.setInt16(b,a,this.littleEndian);return this};c.prototype.readInt16=function(a){a="undefined"!==typeof a?a:(this.offset+=2)-2;if(a+2>this.array.byteLength)throw Error("Cannot read int16 from "+
this+" at "+a+": Capacity overflow");return this.view.getInt16(a,this.littleEndian)};c.prototype.writeShort=c.prototype.writeInt16;c.prototype.readShort=c.prototype.readInt16;c.prototype.writeUint16=function(a,b){b="undefined"!==typeof b?b:(this.offset+=2)-2;this.ensureCapacity(b+2);this.view.setUint16(b,a,this.littleEndian);return this};c.prototype.readUint16=function(a){a="undefined"!==typeof a?a:(this.offset+=2)-2;if(a+2>this.array.byteLength)throw Error("Cannot read int16 from "+this+" at "+a+
": Capacity overflow");return this.view.getUint16(a,this.littleEndian)};c.prototype.writeInt32=function(a,b){b="undefined"!==typeof b?b:(this.offset+=4)-4;this.ensureCapacity(b+4);this.view.setInt32(b,a,this.littleEndian);return this};c.prototype.readInt32=function(a){a="undefined"!==typeof a?a:(this.offset+=4)-4;if(a+4>this.array.byteLength)throw Error("Cannot read int32 from "+this+" at "+a+": Capacity overflow");return this.view.getInt32(a,this.littleEndian)};c.prototype.writeInt=c.prototype.writeInt32;
c.prototype.readInt=c.prototype.readInt32;c.prototype.writeUint32=function(a,b){b="undefined"!=typeof b?b:(this.offset+=4)-4;this.ensureCapacity(b+4);this.view.setUint32(b,a,this.littleEndian);return this};c.prototype.readUint32=function(a){a="undefined"!==typeof a?a:(this.offset+=4)-4;if(a+4>this.array.byteLength)throw Error("Cannot read uint32 from "+this+" at "+a+": Capacity overflow");return this.view.getUint32(a,this.littleEndian)};c.prototype.writeFloat32=function(a,b){b="undefined"!==typeof b?
b:(this.offset+=4)-4;this.ensureCapacity(b+4);this.view.setFloat32(b,a,this.littleEndian);return this};c.prototype.readFloat32=function(a){a="undefined"!==typeof a?a:(this.offset+=4)-4;if(null===this.array||a+4>this.array.byteLength)throw Error("Cannot read float32 from "+this+" at "+a+": Capacity overflow");return this.view.getFloat32(a,this.littleEndian)};c.prototype.writeFloat=c.prototype.writeFloat32;c.prototype.readFloat=c.prototype.readFloat32;c.prototype.writeFloat64=function(a,b){b="undefined"!==
typeof b?b:(this.offset+=8)-8;this.ensureCapacity(b+8);this.view.setFloat64(b,a,this.littleEndian);return this};c.prototype.readFloat64=function(a){a="undefined"!==typeof a?a:(this.offset+=8)-8;if(null===this.array||a+8>this.array.byteLength)throw Error("Cannot read float64 from "+this+" at "+a+": Capacity overflow");return this.view.getFloat64(a,this.littleEndian)};c.prototype.writeDouble=c.prototype.writeFloat64;c.prototype.readDouble=c.prototype.readFloat64;l&&(c.prototype.writeInt64=function(a,
b){b="undefined"!==typeof b?b:(this.offset+=8)-8;"object"===typeof a&&a instanceof l||(a=l.fromNumber(a,!1));this.ensureCapacity(b+8);this.littleEndian?(this.view.setInt32(b,a.getLowBits(),!0),this.view.setInt32(b+4,a.getHighBits(),!0)):(this.view.setInt32(b,a.getHighBits(),!1),this.view.setInt32(b+4,a.getLowBits(),!1));return this},c.prototype.readInt64=function(a){a="undefined"!==typeof a?a:(this.offset+=8)-8;if(null===this.array||a+8>this.array.byteLength)throw this.offset-=8,Error("Cannot read int64 from "+
this+" at "+a+": Capacity overflow");return this.littleEndian?l.fromBits(this.view.getInt32(a,!0),this.view.getInt32(a+4,!0),!1):l.fromBits(this.view.getInt32(a+4,!1),this.view.getInt32(a,!1),!1)},c.prototype.writeUint64=function(a,b){b="undefined"!==typeof b?b:(this.offset+=8)-8;"object"===typeof a&&a instanceof l||(a=l.fromNumber(a,!0));this.ensureCapacity(b+8);this.littleEndian?(this.view.setUint32(b,a.getLowBitsUnsigned(),!0),this.view.setUint32(b+4,a.getHighBitsUnsigned(),!0)):(this.view.setUint32(b,
a.getHighBitsUnsigned(),!1),this.view.setUint32(b+4,a.getLowBitsUnsigned(),!1));return this},c.prototype.readUint64=function(a){a="undefined"!==typeof a?a:(this.offset+=8)-8;if(null===this.array||a+8>this.array.byteLength)throw this.offset-=8,Error("Cannot read int64 from "+this+" at "+a+": Capacity overflow");return this.littleEndian?l.fromBits(this.view.getUint32(a,!0),this.view.getUint32(a+4,!0),!0):l.fromBits(this.view.getUint32(a+4,!1),this.view.getUint32(a,!1),!0)},c.prototype.writeLong=c.prototype.writeInt64,
c.prototype.readLong=c.prototype.readInt64);c.MAX_VARINT32_BYTES=5;c.prototype.writeVarint32=function(a,b){var d="undefined"===typeof b;b="undefined"!==typeof b?b:this.offset;a>>>=0;this.ensureCapacity(b+c.calculateVarint32(a));var e=this.view,f=0;e.setUint8(b,a|128);128<=a?(e.setUint8(b+1,a>>7|128),16384<=a?(e.setUint8(b+2,a>>14|128),2097152<=a?(e.setUint8(b+3,a>>21|128),268435456<=a?(e.setUint8(b+4,a>>28&127),f=5):(e.setUint8(b+3,e.getUint8(b+3)&127),f=4)):(e.setUint8(b+2,e.getUint8(b+2)&127),f=
3)):(e.setUint8(b+1,e.getUint8(b+1)&127),f=2)):(e.setUint8(b,e.getUint8(b)&127),f=1);return d?(this.offset+=f,this):f};c.prototype.readVarint32=function(a){var b="undefined"===typeof a;a="undefined"!==typeof a?a:this.offset;var d=0,e,f=this.view,g=0;do e=f.getUint8(a+d),d<c.MAX_VARINT32_BYTES&&(g|=(e&127)<<7*d>>>0),++d;while(e&128);g|=0;return b?(this.offset+=d,g):{value:g,length:d}};c.prototype.writeZigZagVarint32=function(a,b){return this.writeVarint32(c.zigZagEncode32(a),b)};c.prototype.readZigZagVarint32=
function(a){a=this.readVarint32(a);return"object"===typeof a?(a.value=c.zigZagDecode32(a.value),a):c.zigZagDecode32(a)};c.MAX_VARINT64_BYTES=10;l&&(c.prototype.writeVarint64=function(a,b){var d="undefined"===typeof b;b="undefined"!==typeof b?b:this.offset;"object"===typeof a&&a instanceof l||(a=l.fromNumber(a,!1));var e=a.toInt()>>>0,f=a.shiftRightUnsigned(28).toInt()>>>0,g=a.shiftRightUnsigned(56).toInt()>>>0,k=c.calculateVarint64(a);this.ensureCapacity(b+k);var h=this.view;switch(k){case 10:h.setUint8(b+
9,g>>>7|128);case 9:h.setUint8(b+8,g|128);case 8:h.setUint8(b+7,f>>>21|128);case 7:h.setUint8(b+6,f>>>14|128);case 6:h.setUint8(b+5,f>>>7|128);case 5:h.setUint8(b+4,f|128);case 4:h.setUint8(b+3,e>>>21|128);case 3:h.setUint8(b+2,e>>>14|128);case 2:h.setUint8(b+1,e>>>7|128);case 1:h.setUint8(b+0,e|128)}h.setUint8(b+k-1,h.getUint8(b+k-1)&127);return d?(this.offset+=k,this):k},c.prototype.readVarint64=function(a){var b="undefined"===typeof a,d=a="undefined"!==typeof a?a:this.offset,c=this.view,f,g=0,
k=0,h;h=c.getUint8(a++);f=h&127;if(h&128&&(h=c.getUint8(a++),f|=(h&127)<<7,h&128&&(h=c.getUint8(a++),f|=(h&127)<<14,h&128&&(h=c.getUint8(a++),f|=(h&127)<<21,h&128&&(h=c.getUint8(a++),g=h&127,h&128&&(h=c.getUint8(a++),g|=(h&127)<<7,h&128&&(h=c.getUint8(a++),g|=(h&127)<<14,h&128&&(h=c.getUint8(a++),g|=(h&127)<<21,h&128&&(h=c.getUint8(a++),k=h&127,h&128&&(h=c.getUint8(a++),k|=(h&127)<<7,h&128))))))))))throw Error("Data must be corrupt: Buffer overrun");c=l.from28Bits(f,g,k,!1);return b?(this.offset=
a,c):{value:c,length:a-d}},c.prototype.writeZigZagVarint64=function(a,b){return this.writeVarint64(c.zigZagEncode64(a),b)},c.prototype.readZigZagVarint64=function(a){a=this.readVarint64(a);return"object"!==typeof a||a instanceof l?c.zigZagDecode64(a):(a.value=c.zigZagDecode64(a.value),a)});c.prototype.writeVarint=c.prototype.writeVarint32;c.prototype.readVarint=c.prototype.readVarint32;c.prototype.writeZigZagVarint=c.prototype.writeZigZagVarint32;c.prototype.readZigZagVarint=c.prototype.readZigZagVarint32;
c.calculateVarint32=function(a){a>>>=0;return 128>a?1:16384>a?2:2097152>a?3:268435456>a?4:5};l&&(c.calculateVarint64=function(a){"object"===typeof a&&a instanceof l||(a=l.fromNumber(a,!1));var b=a.toInt()>>>0,d=a.shiftRightUnsigned(28).toInt()>>>0;a=a.shiftRightUnsigned(56).toInt()>>>0;return 0==a?0==d?16384>b?128>b?1:2:2097152>b?3:4:16384>d?128>d?5:6:2097152>d?7:8:128>a?9:10});c.zigZagEncode32=function(a){return((a|=0)<<1^a>>31)>>>0};c.zigZagDecode32=function(a){return a>>>1^-(a&1)|0};l&&(c.zigZagEncode64=
function(a){"object"===typeof a&&a instanceof l?a.unsigned&&(a=a.toSigned()):a=l.fromNumber(a,!1);return a.shiftLeft(1).xor(a.shiftRight(63)).toUnsigned()},c.zigZagDecode64=function(a){"object"===typeof a&&a instanceof l?a.unsigned||(a=a.toUnsigned()):a=l.fromNumber(a,!0);return a.shiftRightUnsigned(1).xor(a.and(l.ONE).toSigned().negate()).toSigned()});c.decodeUTF8Char=function(a,b){var d=a.readUint8(b),c,f,g,k,h,l=b;if(0==(d&128))b+=1;else if(192==(d&224))c=a.readUint8(b+1),d=(d&31)<<6|c&63,b+=2;
else if(224==(d&240))c=a.readUint8(b+1),f=a.readUint8(b+2),d=(d&15)<<12|(c&63)<<6|f&63,b+=3;else if(240==(d&248))c=a.readUint8(b+1),f=a.readUint8(b+2),g=a.readUint8(b+3),d=(d&7)<<18|(c&63)<<12|(f&63)<<6|g&63,b+=4;else if(248==(d&252))c=a.readUint8(b+1),f=a.readUint8(b+2),g=a.readUint8(b+3),k=a.readUint8(b+4),d=(d&3)<<24|(c&63)<<18|(f&63)<<12|(g&63)<<6|k&63,b+=5;else if(252==(d&254))c=a.readUint8(b+1),f=a.readUint8(b+2),g=a.readUint8(b+3),k=a.readUint8(b+4),h=a.readUint8(b+5),d=(d&1)<<30|(c&63)<<24|
(f&63)<<18|(g&63)<<12|(k&63)<<6|h&63,b+=6;else throw Error("Cannot decode UTF8 character at offset "+b+": charCode (0x"+d.toString(16)+") is invalid");return{"char":d,length:b-l}};c.encodeUTF8Char=function(a,b,c){var e=c;if(0>a)throw Error("Cannot encode UTF8 character: charCode ("+a+") is negative");if(128>a)b.writeUint8(a&127,c),c+=1;else if(2048>a)b.writeUint8(a>>6&31|192,c).writeUint8(a&63|128,c+1),c+=2;else if(65536>a)b.writeUint8(a>>12&15|224,c).writeUint8(a>>6&63|128,c+1).writeUint8(a&63|128,
c+2),c+=3;else if(2097152>a)b.writeUint8(a>>18&7|240,c).writeUint8(a>>12&63|128,c+1).writeUint8(a>>6&63|128,c+2).writeUint8(a&63|128,c+3),c+=4;else if(67108864>a)b.writeUint8(a>>24&3|248,c).writeUint8(a>>18&63|128,c+1).writeUint8(a>>12&63|128,c+2).writeUint8(a>>6&63|128,c+3).writeUint8(a&63|128,c+4),c+=5;else if(2147483648>a)b.writeUint8(a>>30&1|252,c).writeUint8(a>>24&63|128,c+1).writeUint8(a>>18&63|128,c+2).writeUint8(a>>12&63|128,c+3).writeUint8(a>>6&63|128,c+4).writeUint8(a&63|128,c+5),c+=6;else throw Error("Cannot encode UTF8 character: charCode (0x"+
a.toString(16)+") is too large (>= 0x80000000)");return c-e};c.calculateUTF8Char=function(a){if(0>a)throw Error("Cannot calculate length of UTF8 character: charCode ("+a+") is negative");if(128>a)return 1;if(2048>a)return 2;if(65536>a)return 3;if(2097152>a)return 4;if(67108864>a)return 5;if(2147483648>a)return 6;throw Error("Cannot calculate length of UTF8 character: charCode (0x"+a.toString(16)+") is too large (>= 0x80000000)");};c.a=function(a){a=""+a;for(var b=0,d=0,e=a.length;d<e;++d)b+=c.calculateUTF8Char(a.charCodeAt(d));
return b};var m="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",m=m+"";c.encode64=function(a){a instanceof c?a.length<a.offset&&(a=a.clone().flip()):a=c.wrap(a);var b,d,e,f,g=a.offset,k=0,h=[];do b=a.readUint8(g++),d=a.length>g?a.readUint8(g++):0,e=a.length>g?a.readUint8(g++):0,f=b<<16|d<<8|e,b=f>>18&63,d=f>>12&63,e=f>>6&63,f&=63,h[k++]=m.charAt(b)+m.charAt(d)+m.charAt(e)+m.charAt(f);while(g<a.length);g=h.join("");a=(a.length-a.offset)%3;return(a?g.slice(0,a-3):g)+"===".slice(a||
3)};c.decode64=function(a,b){if("string"!==typeof a)throw Error("Illegal argument: Not a string");var d,e,f,g,k,h=0,l=new c(Math.ceil(a.length/3),b);do{d=m.indexOf(a.charAt(h++));e=m.indexOf(a.charAt(h++));g=m.indexOf(a.charAt(h++));k=m.indexOf(a.charAt(h++));if(0>d||0>e||0>g||0>k)throw Error("Illegal argument: Not a valid base64 encoded string");f=d<<18|e<<12|g<<6|k;d=f>>16&255;e=f>>8&255;f&=255;64==g?l.writeUint8(d):64==k?l.writeUint8(d).writeUint8(e):l.writeUint8(d).writeUint8(e).writeUint8(f)}while(h<
a.length);return l.flip()};c.encodeHex=function(a){a instanceof c?a.length<a.offset&&(a=a.clone().flip()):a=c.wrap(a);if(null===a.array)return"";for(var b,d=[],e=a.offset,f=a.length;e<f;++e)b=a.view.getUint8(e).toString(16).toUpperCase(),2>b.length&&(b="0"+b),d.push(b);return d.join("")};c.decodeHex=function(a,b){if("string"!==typeof a)throw Error("Illegal argument: Not a string");if(0!==a.length%2)throw Error("Illegal argument: Not a hex encoded string");for(var d=new c(a.length/2,b),e=0,f=a.length;e<
f;e+=2)d.writeUint8(parseInt(a.substring(e,e+2),16));return d.flip()};c.encodeBinary=function(a){a instanceof c?a.length<a.offset&&(a=a.clone().flip()):a=c.wrap(a);var b=[],d=a.view,e=a.offset;for(a=a.length;e<a;++e)b.push(String.fromCharCode(d.getUint8(e)));return b.join("")};c.decodeBinary=function(a,b){if("string"!==typeof a)throw Error("Illegal argument: Not a string");for(var d=a.length,e=new ArrayBuffer(d),f=new DataView(e),g,k=0;k<d;++k){if(255<(g=a.charCodeAt(k)))throw Error("Illegal argument: Not a binary string (char code "+
g+")");f.setUint8(k,g)}g=new c(d,b,!0);g.array=e;g.view=f;g.length=d;return g};c.prototype.writeUTF8String=function(a,b){var d="undefined"===typeof b,e=b="undefined"!==typeof b?b:this.offset,f=c.a(a);this.ensureCapacity(b+f);for(var f=0,g=a.length;f<g;++f)b+=c.encodeUTF8Char(a.charCodeAt(f),this,b);return d?(this.offset=b,this):b-e};c.prototype.readUTF8String=function(a,b){var d="undefined"===typeof b;b="undefined"!==typeof b?b:this.offset;for(var e,f="",g=b,k=0;k<a;++k)e=c.decodeUTF8Char(this,b),
b+=e.length,f+=String.fromCharCode(e["char"]);return d?(this.offset=b,f):{string:f,length:b-g}};c.prototype.readUTF8StringBytes=function(a,b){var d="undefined"===typeof b;b="undefined"!==typeof b?b:this.offset;var e,f="",g=b;for(a=b+a;b<a;)e=c.decodeUTF8Char(this,b),b+=e.length,f+=String.fromCharCode(e["char"]);if(b!=a)throw Error("Actual string length differs from the specified: "+((b>a?"+":"")+b-a)+" bytes");return d?(this.offset=b,f):{string:f,length:b-g}};c.prototype.writeLString=function(a,b){a=
""+a;var d="undefined"===typeof b;b="undefined"!==typeof b?b:this.offset;var e=c.encodeUTF8Char(a.length,this,b),e=e+this.writeUTF8String(a,b+e);return d?(this.offset+=e,this):e};c.prototype.readLString=function(a){var b="undefined"===typeof a;a="undefined"!==typeof a?a:this.offset;var d=c.decodeUTF8Char(this,a);a=this.readUTF8String(d["char"],a+d.length);return b?(this.offset+=d.length+a.length,a.string):{string:a.string,length:d.length+a.length}};c.prototype.writeVString=function(a,b){a=""+a;var d=
"undefined"===typeof b;b="undefined"!==typeof b?b:this.offset;var e=this.writeVarint32(c.a(a),b),e=e+this.writeUTF8String(a,b+e);return d?(this.offset+=e,this):e};c.prototype.readVString=function(a){var b="undefined"===typeof a;a="undefined"!==typeof a?a:this.offset;var c=this.readVarint32(a);a=this.readUTF8StringBytes(c.value,a+c.length);return b?(this.offset+=c.length+a.length,a.string):{string:a.string,length:c.length+a.length}};c.prototype.writeCString=function(a,b){var c="undefined"===typeof b;
b="undefined"!==typeof b?b:this.offset;var e=this.writeUTF8String(""+a,b);this.writeUint8(0,b+e);return c?(this.offset+=e+1,this):e+1};c.prototype.readCString=function(a){var b="undefined"===typeof a;a="undefined"!==typeof a?a:this.offset;var d,e="",f=a;do d=c.decodeUTF8Char(this,a),a+=d.length,0!=d["char"]&&(e+=String.fromCharCode(d["char"]));while(0!=d["char"]);return b?(this.offset=a,e):{string:e,length:a-f}};c.prototype.writeJSON=function(a,b,c){c="function"===typeof c?c:JSON.stringify;return this.writeLString(c(a),
b)};c.prototype.readJSON=function(a,b){b="function"===typeof b?b:JSON.parse;var c=this.readLString(a);return"string"===typeof c?b(c):{data:b(c.string),length:c.length}};c.prototype.toColumns=function(a){if(null===this.array)return"DESTROYED";a="undefined"!==typeof a?parseInt(a,10):16;1>a&&(a=16);for(var b="",c=[],e,f=this.view,b=0==this.offset&&0==this.length?b+"|":0==this.length?b+">":0==this.offset?b+"<":b+" ",g=0,k=this.array.byteLength;g<k;++g){if(0<g&&0==g%a){for(;b.length<3*a+1;)b+="   ";c.push(b);
b=" "}e=f.getUint8(g).toString(16).toUpperCase();2>e.length&&(e="0"+e);b+=e;b=g+1==this.offset&&g+1==this.length?b+"|":g+1==this.offset?b+"<":g+1==this.length?b+">":b+" "}" "!=b&&c.push(b);g=0;for(k=c.length;g<k;++g)for(;c[g].length<3*a+1;)c[g]+="   ";for(var h=0,b="",g=0,k=this.array.byteLength;g<k;++g)0<g&&0==g%a&&(c[h]+=" "+b,b="",h++),e=f.getUint8(g),b+=32<e&&127>e?String.fromCharCode(e):".";""!=b&&(c[h]+=" "+b);return c.join("\n")};c.prototype.printDebug=function(a){"function"!==typeof a&&(a=
console.log.bind(console));a((null!=this.array?"ByteBuffer(offset="+this.offset+",markedOffset="+this.markedOffset+",length="+this.length+",capacity="+this.array.byteLength+")":"ByteBuffer(DESTROYED)")+"\n-------------------------------------------------------------------\n"+this.toColumns()+"\n")};c.prototype.toHex=function(a){var b="",d=this.view,e,f;if(a){if(null===this.array)return"DESTROYED";b=0==this.offset&&0==this.length?b+"|":0==this.length?b+">":0==this.offset?b+"<":b+" ";e=0;for(f=this.array.byteLength;e<
f;++e)a=d.getUint8(e).toString(16).toUpperCase(),2>a.length&&(a="0"+a),b+=a,b=e+1===this.offset&&e+1===this.length?b+"|":e+1==this.offset?b+"<":e+1==this.length?b+">":b+" ";return b}return c.encodeHex(this)};c.prototype.toBinary=function(){return c.encodeBinary(this)};c.prototype.toBase64=function(){return null===this.array||this.offset>=this.length?"":c.encode64(this)};c.prototype.toUTF8=function(){return null===this.array||this.offset>=this.length?"":this.readUTF8StringBytes(this.length-this.offset,
this.offset).string};c.prototype.toString=function(a){switch(a||""){case "utf8":return this.toUTF8();case "base64":return this.toBase64();case "hex":return this.toHex();case "binary":return this.toBinary();case "debug":return this.toHex(!0);default:return null===this.array?"ByteBuffer(DESTROYED)":"ByteBuffer(offset="+this.offset+",markedOffset="+this.markedOffset+",length="+this.length+",capacity="+this.array.byteLength+")"}};c.prototype.toArrayBuffer=function(a){if(null===this.array)return null;
var b=this.clone();b.offset>b.length&&b.flip();var c=!1;if(0<b.offset||b.length<b.array.byteLength)b.compact(),c=!0;return a&&!c?b.copy().array:b.array};p&&(c.prototype.toBuffer=function(){if(null===this.array)return null;var a=this.offset,b=this.length;if(a>b)var c=a,a=b,b=c;return new p((new Uint8Array(this.array)).subarray(a,b))});return c}"undefined"!==typeof module&&module.exports?module.exports=q(_dereq_("long")):"undefined"!==typeof define&&define.amd?define("ByteBuffer",["Math/Long"],function(l){return q(l)}):
(n.dcodeIO||(n.dcodeIO={}),n.dcodeIO.ByteBuffer=q(n.dcodeIO.Long))})(this);

},{}],"bytebuffer":[function(_dereq_,module,exports){
module.exports=_dereq_('BPteWg');
},{}],"long":[function(_dereq_,module,exports){
module.exports=_dereq_('1zQ60j');
},{}],"1zQ60j":[function(_dereq_,module,exports){
/*
 Long.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
 Released under the Apache License, Version 2.0
 see: https://github.com/dcodeIO/Long.js for details

 Long.js is based on goog.math.Long from the Closure Library.
 Copyright 2009 The Closure Library Authors. All Rights Reserved.
 Released under the Apache License, Version 2.0
 see: https://code.google.com/p/closure-library/ for details
*/
var p=!1;
(function(r){function b(a,b,d){this.low=a|0;this.high=b|0;this.unsigned=!!d}var s={},t={};b.fromInt=function(a,c){if(c){a>>>=0;if(0<=a&&256>a&&(d=t[a]))return d;d=new b(a,0>(a|0)?-1:0,!0);0<=a&&256>a&&(t[a]=d)}else{a|=0;if(-128<=a&&128>a){var d=s[a];if(d)return d}d=new b(a,0>a?-1:0,p);-128<=a&&128>a&&(s[a]=d)}return d};b.fromNumber=function(a,c){c=!!c;return isNaN(a)||!isFinite(a)?b.ZERO:!c&&a<=-u?b.MIN_SIGNED_VALUE:c&&0>=a?b.MIN_UNSIGNED_VALUE:!c&&a+1>=u?b.MAX_SIGNED_VALUE:c&&a>=v?b.MAX_UNSIGNED_VALUE:0>
a?b.fromNumber(-a,p).negate():new b(a%l|0,a/l|0,c)};b.fromBits=function(a,c,d){return new b(a,c,d)};b.from28Bits=function(a,c,d,e){return b.fromBits(a|c<<28,c>>>4|d<<24,e)};b.fromString=function(a,c,d){if(0==a.length)throw Error("number format error: empty string");"number"==typeof c&&(d=c,c=p);d=d||10;if(2>d||36<d)throw Error("radix out of range: "+d);if("-"==a.charAt(0))return b.fromString(a.substring(1),c,d).negate();if(0<=a.indexOf("-"))throw Error('number format error: interior "-" character: '+
a);c=b.fromNumber(Math.pow(d,8));for(var e=b.ZERO,g=0;g<a.length;g+=8){var f=Math.min(8,a.length-g),k=parseInt(a.substring(g,g+f),d);8>f?(f=b.fromNumber(Math.pow(d,f)),e=e.multiply(f).add(b.fromNumber(k))):(e=e.multiply(c),e=e.add(b.fromNumber(k)))}return e};var l=4294967296,v=l*l,u=v/2,w=b.fromInt(16777216);b.ZERO=b.fromInt(0);b.ONE=b.fromInt(1);b.NEG_ONE=b.fromInt(-1);b.MAX_SIGNED_VALUE=b.fromBits(-1,2147483647,p);b.MAX_UNSIGNED_VALUE=b.fromBits(-1,-1,!0);b.MAX_VALUE=b.MAX_SIGNED_VALUE;b.MIN_SIGNED_VALUE=
b.fromBits(0,-2147483648,p);b.MIN_UNSIGNED_VALUE=b.fromBits(0,0,!0);b.MIN_VALUE=b.MIN_SIGNED_VALUE;b.prototype.toInt=function(){return this.unsigned?this.low>>>0:this.low};b.prototype.toNumber=function(){return this.unsigned?(this.high>>>0)*l+(this.low>>>0):this.high*l+(this.low>>>0)};b.prototype.toString=function(a){a=a||10;if(2>a||36<a)throw Error("radix out of range: "+a);if(this.isZero())return"0";if(this.isNegative()){if(this.equals(b.MIN_SIGNED_VALUE)){var c=b.fromNumber(a),d=this.div(c),c=
d.multiply(c).subtract(this);return d.toString(a)+c.toInt().toString(a)}return"-"+this.negate().toString(a)}for(var d=b.fromNumber(Math.pow(a,6)),c=this,e="";;){var g=c.div(d),f=c.subtract(g.multiply(d)).toInt().toString(a),c=g;if(c.isZero())return f+e;for(;6>f.length;)f="0"+f;e=""+f+e}};b.prototype.getHighBits=function(){return this.high};b.prototype.getHighBitsUnsigned=function(){return this.high>>>0};b.prototype.getLowBits=function(){return this.low};b.prototype.getLowBitsUnsigned=function(){return this.low>>>
0};b.prototype.getNumBitsAbs=function(){if(this.isNegative())return this.equals(b.MIN_SIGNED_VALUE)?64:this.negate().getNumBitsAbs();for(var a=0!=this.high?this.high:this.low,c=31;0<c&&0==(a&1<<c);c--);return 0!=this.high?c+33:c+1};b.prototype.isZero=function(){return 0==this.high&&0==this.low};b.prototype.isNegative=function(){return!this.unsigned&&0>this.high};b.prototype.isOdd=function(){return 1==(this.low&1)};b.prototype.equals=function(a){return this.unsigned!=a.unsigned&&this.high>>>31!=a.high>>>
31?p:this.high==a.high&&this.low==a.low};b.prototype.notEquals=function(a){return!this.equals(a)};b.prototype.lessThan=function(a){return 0>this.compare(a)};b.prototype.lessThanOrEqual=function(a){return 0>=this.compare(a)};b.prototype.greaterThan=function(a){return 0<this.compare(a)};b.prototype.greaterThanOrEqual=function(a){return 0<=this.compare(a)};b.prototype.compare=function(a){if(this.equals(a))return 0;var b=this.isNegative(),d=a.isNegative();return b&&!d?-1:!b&&d?1:this.unsigned?a.high>>>
0>this.high>>>0||a.high==this.high&&a.low>>>0>this.low>>>0?-1:1:this.subtract(a).isNegative()?-1:1};b.prototype.negate=function(){return!this.unsigned&&this.equals(b.MIN_SIGNED_VALUE)?b.MIN_SIGNED_VALUE:this.not().add(b.ONE)};b.prototype.add=function(a){var c=this.high>>>16,d=this.high&65535,e=this.low>>>16,g=a.high>>>16,f=a.high&65535,k=a.low>>>16,q;q=0+((this.low&65535)+(a.low&65535));a=0+(q>>>16);a+=e+k;e=0+(a>>>16);e+=d+f;d=0+(e>>>16);d=d+(c+g)&65535;return b.fromBits((a&65535)<<16|q&65535,d<<
16|e&65535,this.unsigned)};b.prototype.subtract=function(a){return this.add(a.negate())};b.prototype.multiply=function(a){if(this.isZero()||a.isZero())return b.ZERO;if(this.equals(b.MIN_VALUE))return a.isOdd()?b.MIN_VALUE:b.ZERO;if(a.equals(b.MIN_VALUE))return this.isOdd()?b.MIN_VALUE:b.ZERO;if(this.isNegative())return a.isNegative()?this.negate().multiply(a.negate()):this.negate().multiply(a).negate();if(a.isNegative())return this.multiply(a.negate()).negate();if(this.lessThan(w)&&a.lessThan(w))return b.fromNumber(this.toNumber()*
a.toNumber(),this.unsigned);var c=this.high>>>16,d=this.high&65535,e=this.low>>>16,g=this.low&65535,f=a.high>>>16,k=a.high&65535,q=a.low>>>16;a=a.low&65535;var n,h,m,l;l=0+g*a;m=0+(l>>>16);m+=e*a;h=0+(m>>>16);m=(m&65535)+g*q;h+=m>>>16;m&=65535;h+=d*a;n=0+(h>>>16);h=(h&65535)+e*q;n+=h>>>16;h&=65535;h+=g*k;n+=h>>>16;h&=65535;n=n+(c*a+d*q+e*k+g*f)&65535;return b.fromBits(m<<16|l&65535,n<<16|h,this.unsigned)};b.prototype.div=function(a){if(a.isZero())throw Error("division by zero");if(this.isZero())return b.ZERO;
if(this.equals(b.MIN_SIGNED_VALUE)){if(a.equals(b.ONE)||a.equals(b.NEG_ONE))return min;if(a.equals(b.MIN_VALUE))return b.ONE;var c=this.shiftRight(1).div(a).shiftLeft(1);if(c.equals(b.ZERO))return a.isNegative()?b.ONE:b.NEG_ONE;var d=this.subtract(a.multiply(c));return c.add(d.div(a))}if(a.equals(b.MIN_VALUE))return b.ZERO;if(this.isNegative())return a.isNegative()?this.negate().div(a.negate()):this.negate().div(a).negate();if(a.isNegative())return this.div(a.negate()).negate();for(var e=b.ZERO,d=
this;d.greaterThanOrEqual(a);){for(var c=Math.max(1,Math.floor(d.toNumber()/a.toNumber())),g=Math.ceil(Math.log(c)/Math.LN2),g=48>=g?1:Math.pow(2,g-48),f=b.fromNumber(c,this.unsigned),k=f.multiply(a);k.isNegative()||k.greaterThan(d);)c-=g,f=b.fromNumber(c,this.unsigned),k=f.multiply(a);f.isZero()&&(f=b.ONE);e=e.add(f);d=d.subtract(k)}return e};b.prototype.modulo=function(a){return this.subtract(this.div(a).multiply(a))};b.prototype.not=function(){return b.fromBits(~this.low,~this.high,this.unsigned)};
b.prototype.and=function(a){return b.fromBits(this.low&a.low,this.high&a.high,this.unsigned)};b.prototype.or=function(a){return b.fromBits(this.low|a.low,this.high|a.high,this.unsigned)};b.prototype.xor=function(a){return b.fromBits(this.low^a.low,this.high^a.high,this.unsigned)};b.prototype.shiftLeft=function(a){a&=63;if(0==a)return this;var c=this.low;return 32>a?b.fromBits(c<<a,this.high<<a|c>>>32-a,this.unsigned):b.fromBits(0,c<<a-32,this.unsigned)};b.prototype.shiftRight=function(a){a&=63;if(0==
a)return this;var c=this.high;return 32>a?b.fromBits(this.low>>>a|c<<32-a,c>>a,this.unsigned):b.fromBits(c>>a-32,0<=c?0:-1,this.unsigned)};b.prototype.shiftRightUnsigned=function(a){a&=63;if(0==a)return this;var c=this.high;return 32>a?b.fromBits(this.low>>>a|c<<32-a,c>>>a,this.unsigned):32==a?b.fromBits(c,0,this.unsigned):b.fromBits(c>>>a-32,0,this.unsigned)};b.prototype.toSigned=function(){var a=this.clone();a.unsigned=p;return a};b.prototype.toUnsigned=function(){var a=this.clone();a.unsigned=
!0;return a};b.prototype.clone=function(){return new b(this.low,this.high,this.unsigned)};"undefined"!=typeof module&&module.exports?module.exports=b:"undefined"!=typeof define&&define.amd?define("Math/Long",[],function(){return b}):(r.dcodeIO||(r.dcodeIO={}),r.dcodeIO.Long=b)})(this);

},{}],15:[function(_dereq_,module,exports){
/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */(function() {'use strict';var m=this;function q(c,d){var a=c.split("."),b=m;!(a[0]in b)&&b.execScript&&b.execScript("var "+a[0]);for(var e;a.length&&(e=a.shift());)!a.length&&void 0!==d?b[e]=d:b=b[e]?b[e]:b[e]={}};var s="undefined"!==typeof Uint8Array&&"undefined"!==typeof Uint16Array&&"undefined"!==typeof Uint32Array&&"undefined"!==typeof DataView;function t(c){var d=c.length,a=0,b=Number.POSITIVE_INFINITY,e,f,g,h,k,l,p,n,r;for(n=0;n<d;++n)c[n]>a&&(a=c[n]),c[n]<b&&(b=c[n]);e=1<<a;f=new (s?Uint32Array:Array)(e);g=1;h=0;for(k=2;g<=a;){for(n=0;n<d;++n)if(c[n]===g){l=0;p=h;for(r=0;r<g;++r)l=l<<1|p&1,p>>=1;for(r=l;r<e;r+=k)f[r]=g<<16|n;++h}++g;h<<=1;k<<=1}return[f,a,b]};function u(c,d){this.g=[];this.h=32768;this.d=this.f=this.a=this.l=0;this.input=s?new Uint8Array(c):c;this.m=!1;this.i=v;this.r=!1;if(d||!(d={}))d.index&&(this.a=d.index),d.bufferSize&&(this.h=d.bufferSize),d.bufferType&&(this.i=d.bufferType),d.resize&&(this.r=d.resize);switch(this.i){case w:this.b=32768;this.c=new (s?Uint8Array:Array)(32768+this.h+258);break;case v:this.b=0;this.c=new (s?Uint8Array:Array)(this.h);this.e=this.z;this.n=this.v;this.j=this.w;break;default:throw Error("invalid inflate mode");
}}var w=0,v=1,x={t:w,s:v};
u.prototype.k=function(){for(;!this.m;){var c=y(this,3);c&1&&(this.m=!0);c>>>=1;switch(c){case 0:var d=this.input,a=this.a,b=this.c,e=this.b,f=d.length,g=void 0,h=void 0,k=b.length,l=void 0;this.d=this.f=0;if(a+1>=f)throw Error("invalid uncompressed block header: LEN");g=d[a++]|d[a++]<<8;if(a+1>=f)throw Error("invalid uncompressed block header: NLEN");h=d[a++]|d[a++]<<8;if(g===~h)throw Error("invalid uncompressed block header: length verify");if(a+g>d.length)throw Error("input buffer is broken");switch(this.i){case w:for(;e+
g>b.length;){l=k-e;g-=l;if(s)b.set(d.subarray(a,a+l),e),e+=l,a+=l;else for(;l--;)b[e++]=d[a++];this.b=e;b=this.e();e=this.b}break;case v:for(;e+g>b.length;)b=this.e({p:2});break;default:throw Error("invalid inflate mode");}if(s)b.set(d.subarray(a,a+g),e),e+=g,a+=g;else for(;g--;)b[e++]=d[a++];this.a=a;this.b=e;this.c=b;break;case 1:this.j(z,A);break;case 2:B(this);break;default:throw Error("unknown BTYPE: "+c);}}return this.n()};
var C=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],D=s?new Uint16Array(C):C,E=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],F=s?new Uint16Array(E):E,G=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],H=s?new Uint8Array(G):G,I=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],J=s?new Uint16Array(I):I,K=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,
13],L=s?new Uint8Array(K):K,M=new (s?Uint8Array:Array)(288),N,O;N=0;for(O=M.length;N<O;++N)M[N]=143>=N?8:255>=N?9:279>=N?7:8;var z=t(M),P=new (s?Uint8Array:Array)(30),Q,R;Q=0;for(R=P.length;Q<R;++Q)P[Q]=5;var A=t(P);function y(c,d){for(var a=c.f,b=c.d,e=c.input,f=c.a,g=e.length,h;b<d;){if(f>=g)throw Error("input buffer is broken");a|=e[f++]<<b;b+=8}h=a&(1<<d)-1;c.f=a>>>d;c.d=b-d;c.a=f;return h}
function S(c,d){for(var a=c.f,b=c.d,e=c.input,f=c.a,g=e.length,h=d[0],k=d[1],l,p;b<k&&!(f>=g);)a|=e[f++]<<b,b+=8;l=h[a&(1<<k)-1];p=l>>>16;c.f=a>>p;c.d=b-p;c.a=f;return l&65535}
function B(c){function d(a,c,b){var d,e,f,g;for(g=0;g<a;)switch(d=S(this,c),d){case 16:for(f=3+y(this,2);f--;)b[g++]=e;break;case 17:for(f=3+y(this,3);f--;)b[g++]=0;e=0;break;case 18:for(f=11+y(this,7);f--;)b[g++]=0;e=0;break;default:e=b[g++]=d}return b}var a=y(c,5)+257,b=y(c,5)+1,e=y(c,4)+4,f=new (s?Uint8Array:Array)(D.length),g,h,k,l;for(l=0;l<e;++l)f[D[l]]=y(c,3);if(!s){l=e;for(e=f.length;l<e;++l)f[D[l]]=0}g=t(f);h=new (s?Uint8Array:Array)(a);k=new (s?Uint8Array:Array)(b);c.j(t(d.call(c,a,g,h)),
t(d.call(c,b,g,k)))}u.prototype.j=function(c,d){var a=this.c,b=this.b;this.o=c;for(var e=a.length-258,f,g,h,k;256!==(f=S(this,c));)if(256>f)b>=e&&(this.b=b,a=this.e(),b=this.b),a[b++]=f;else{g=f-257;k=F[g];0<H[g]&&(k+=y(this,H[g]));f=S(this,d);h=J[f];0<L[f]&&(h+=y(this,L[f]));b>=e&&(this.b=b,a=this.e(),b=this.b);for(;k--;)a[b]=a[b++-h]}for(;8<=this.d;)this.d-=8,this.a--;this.b=b};
u.prototype.w=function(c,d){var a=this.c,b=this.b;this.o=c;for(var e=a.length,f,g,h,k;256!==(f=S(this,c));)if(256>f)b>=e&&(a=this.e(),e=a.length),a[b++]=f;else{g=f-257;k=F[g];0<H[g]&&(k+=y(this,H[g]));f=S(this,d);h=J[f];0<L[f]&&(h+=y(this,L[f]));b+k>e&&(a=this.e(),e=a.length);for(;k--;)a[b]=a[b++-h]}for(;8<=this.d;)this.d-=8,this.a--;this.b=b};
u.prototype.e=function(){var c=new (s?Uint8Array:Array)(this.b-32768),d=this.b-32768,a,b,e=this.c;if(s)c.set(e.subarray(32768,c.length));else{a=0;for(b=c.length;a<b;++a)c[a]=e[a+32768]}this.g.push(c);this.l+=c.length;if(s)e.set(e.subarray(d,d+32768));else for(a=0;32768>a;++a)e[a]=e[d+a];this.b=32768;return e};
u.prototype.z=function(c){var d,a=this.input.length/this.a+1|0,b,e,f,g=this.input,h=this.c;c&&("number"===typeof c.p&&(a=c.p),"number"===typeof c.u&&(a+=c.u));2>a?(b=(g.length-this.a)/this.o[2],f=258*(b/2)|0,e=f<h.length?h.length+f:h.length<<1):e=h.length*a;s?(d=new Uint8Array(e),d.set(h)):d=h;return this.c=d};
u.prototype.n=function(){var c=0,d=this.c,a=this.g,b,e=new (s?Uint8Array:Array)(this.l+(this.b-32768)),f,g,h,k;if(0===a.length)return s?this.c.subarray(32768,this.b):this.c.slice(32768,this.b);f=0;for(g=a.length;f<g;++f){b=a[f];h=0;for(k=b.length;h<k;++h)e[c++]=b[h]}f=32768;for(g=this.b;f<g;++f)e[c++]=d[f];this.g=[];return this.buffer=e};
u.prototype.v=function(){var c,d=this.b;s?this.r?(c=new Uint8Array(d),c.set(this.c.subarray(0,d))):c=this.c.subarray(0,d):(this.c.length>d&&(this.c.length=d),c=this.c);return this.buffer=c};function T(c,d){var a,b;this.input=c;this.a=0;if(d||!(d={}))d.index&&(this.a=d.index),d.verify&&(this.A=d.verify);a=c[this.a++];b=c[this.a++];switch(a&15){case U:this.method=U;break;default:throw Error("unsupported compression method");}if(0!==((a<<8)+b)%31)throw Error("invalid fcheck flag:"+((a<<8)+b)%31);if(b&32)throw Error("fdict flag is not supported");this.q=new u(c,{index:this.a,bufferSize:d.bufferSize,bufferType:d.bufferType,resize:d.resize})}
T.prototype.k=function(){var c=this.input,d,a;d=this.q.k();this.a=this.q.a;if(this.A){a=(c[this.a++]<<24|c[this.a++]<<16|c[this.a++]<<8|c[this.a++])>>>0;var b=d;if("string"===typeof b){var e=b.split(""),f,g;f=0;for(g=e.length;f<g;f++)e[f]=(e[f].charCodeAt(0)&255)>>>0;b=e}for(var h=1,k=0,l=b.length,p,n=0;0<l;){p=1024<l?1024:l;l-=p;do h+=b[n++],k+=h;while(--p);h%=65521;k%=65521}if(a!==(k<<16|h)>>>0)throw Error("invalid adler-32 checksum");}return d};var U=8;q("Zlib.Inflate",T);q("Zlib.Inflate.prototype.decompress",T.prototype.k);var V={ADAPTIVE:x.s,BLOCK:x.t},W,X,Y,Z;if(Object.keys)W=Object.keys(V);else for(X in W=[],Y=0,V)W[Y++]=X;Y=0;for(Z=W.length;Y<Z;++Y)X=W[Y],q("Zlib.Inflate.BufferType."+X,V[X]);}).call(this); //@ sourceMappingURL=inflate.min.js.map

},{}]},{},[7])
(7)
});
},{}]},{},[2])