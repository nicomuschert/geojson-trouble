import { Position, Geometry } from 'geojson';
declare type SupportedGeometries = Geometry | Position[] | Position[][] | Position[][][];
declare const _default: (geometry: SupportedGeometries) => import("geojson").Point | import("geojson").MultiPoint | import("geojson").LineString | import("geojson").MultiLineString | import("geojson").Polygon | import("geojson").MultiPolygon | import("geojson").GeometryCollection | {
    type: string;
    coordinates: Position[][];
} | {
    type: string;
    coordinates: Position[][][];
};
/**
 * Applies the right hand rule to Polygons and Multi-Polygons in GeoJSON structs.
 * [RFC7946]{@link https://tools.ietf.org/html/rfc7946}
 **/
export default _default;
export declare const applyRightHandRule: (geometry: SupportedGeometries, invert?: boolean) => import("geojson").Point | import("geojson").MultiPoint | import("geojson").LineString | import("geojson").MultiLineString | import("geojson").Polygon | import("geojson").MultiPolygon | import("geojson").GeometryCollection | {
    type: string;
    coordinates: Position[][];
} | {
    type: string;
    coordinates: Position[][][];
};
export declare const fixRings: (rings: Position[][], invert?: boolean) => Position[][];
