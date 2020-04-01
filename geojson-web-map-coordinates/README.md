# geojson-web-map-coordinates

This repo addresses the problem that web maps (e.g. leaflet or mapbox) don't display LINES
from one point to the closest other. Sometimes the rendering turns around the world instead to fullfill our
expectations.

It's not charming, but one way to solve this problem is to generate invalid GeoJSON.
We simply pass lines over the longitude +180/-180.

## Install

```sh
$ npm install geojson-web-map-coordinates
$ npm install @types/geojson --save-dev # when using typescript
```

## Usage

```js
import mapCoordinates from 'geojson-web-map-coordinates'

const geometry = mapCoordinates([[-170, -10], [175, 0], [-170, 10]])
console.log(JSON.stringify(geometry))
// {"type":"LineString","coordinates":[...,[-185,0],...]}
```
