call browserify . -t ./node_modules/osm-pbf/browser/transforms.js -o ./dist/osm-pbf-leaflet.js
call browserify -e ./indexWorker.js -t ./node_modules/osm-pbf/browser/transforms.js -o ./dist/osm-pbf-worker.js
