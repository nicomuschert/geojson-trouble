# geojson-apply-right-hand-rule

This repo addresses the problem that not all GeoJSON-Files follow the
[right hand rule](https://tools.ietf.org/html/rfc7946#section-3.1.6):

> A linear ring MUST follow the right-hand rule with respect to the
> area it bounds, i.e., exterior rings are counterclockwise, and
> holes are clockwise.

It also takes care that the first and last linear ring positions are equivalent - specs say:

> they MUST contain identical values

You can also use the following tools to enforce the ring winding order:

- mapbox/geojson-rewind (based on area calculation)
- Turfjs/turf-rewind (even based on the shoelace formula)

## Install

```sh
$ npm install geojson-apply-right-hand-rule
$ npm install @types/geojson --save-dev # when using typescript
```

## Usage

```js
import mapCoordinates from 'geojson-apply-right-hand-rule'

const clockwise = [[100, 0], [100, 1], [101, 1], [101, 0], [100, 0]]
const geometry = mapCoordinates(clockwise)
console.log(JSON.stringify(geometry))
// {"type":"Polygon","coordinates":[[..., [101, 0], ..., [100, 1], ...]]}
```
