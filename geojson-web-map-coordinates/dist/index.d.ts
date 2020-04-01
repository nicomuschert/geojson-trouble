import { Position, Geometry, BBox } from 'geojson';
declare type SupportedGeometries = Geometry | Position[] | Position[][] | Position[][][];
declare const _default: (geometry: SupportedGeometries) => import("geojson").Point | import("geojson").MultiPoint | import("geojson").LineString | import("geojson").MultiLineString | import("geojson").Polygon | import("geojson").MultiPolygon | import("geojson").GeometryCollection | {
    type: string;
    coordinates: Position[];
} | {
    type: string;
    coordinates: Position[][];
} | {
    type: string;
    coordinates: Position[][][];
};
/**
 * Changes geometry coordinates that we can show antimeridian exceeding lines on web maps.
 */
export default _default;
export declare const applyWebMapCoordinates: (geometry: SupportedGeometries, invert?: boolean) => import("geojson").Point | import("geojson").MultiPoint | import("geojson").LineString | import("geojson").MultiLineString | import("geojson").Polygon | import("geojson").MultiPolygon | import("geojson").GeometryCollection | {
    type: string;
    coordinates: Position[];
} | {
    type: string;
    coordinates: Position[][];
} | {
    type: string;
    coordinates: Position[][][];
};
export declare const bbox: (array: any) => BBox;
