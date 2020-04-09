# geojson-web-map-coordinates-cutter

This repo addresses the problem that we get geometries from web maps (e.g. leaflet or mapbox)
that cross the antimeridian - any number of times.

The case is well explained in [RFC7946 3.1.9.](https://tools.ietf.org/html/rfc7946#section-3.1.9).
This implementation is pretty generic and works for all geometries.
Does the RFC show _exactly_ your case? Then you would like to filter (drop) the returned "-180/180\*\*"-segments.

## Install

```sh
$ npm install geojson-web-map-coordinates-cutter
$ npm install @types/geojson --save-dev # when using typescript
```

## Usage

```js
import Cutter from 'geojson-web-map-coordinates-cutter'

const cutter = new Cutter()
const geometry = cutter.cut([[-590, 0], [570, 0]])
console.log(JSON.stringify(geometry))
// "type": "MultiLineString", "coordinates": [[[130, 0], [180, 0]], [[-180, 0], [180, 0]], [[-180, 0], [-150, 0]]] ...
```
