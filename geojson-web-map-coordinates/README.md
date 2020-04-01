# geojson-web-map-coordinates

This repo addresses the problem that web maps (e.g. leaflet or mapbox) don't display LINES
from one point to the closest other. Sometimes the rendering turns around the world instead to fullfill our
expectations.

It's not charming, but one way to solve this problem is to generate invalid GeoJSON.
We simply pass lines over the longitude +180/-180.
