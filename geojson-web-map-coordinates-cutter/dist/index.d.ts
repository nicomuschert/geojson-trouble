import { Position, Geometry, GeometryCollection } from 'geojson';
import { LineString, MultiLineString, Polygon, MultiPolygon, Point, MultiPoint } from 'geojson';
declare type Primitive = LineString | MultiLineString | Polygon | Position | Position[] | Position[][] | Position[][][] | Point | MultiPoint;
export interface InterpolatorFunction {
    (lon: number, a: Position, b: Position): Position[];
}
export interface IsHoleFunction {
    (hole: Position[], outerRing: Position[]): boolean;
}
export default class Cutter {
    private applyCoordinateTranslation;
    private interpolatorFn;
    private isHoleFn;
    constructor(applyCoordinateTranslation?: boolean, interpolatorFn?: InterpolatorFunction, isHoleFn?: IsHoleFunction);
    cut(geometry: Primitive | MultiPolygon | GeometryCollection): Geometry;
    private cutPrimitive;
    private cutRings;
}
export {};
