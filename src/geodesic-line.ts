import L from "leaflet";
import { GeodesicOptions } from "./geodesic-core"
import { GeodesicGeometry } from "./geodesic-geom";
import { latlngExpressiontoLiteral } from "../src/types-helper";

export class GeodesicLine extends L.Layer {
    readonly polyline: L.Polyline;
    readonly options: GeodesicOptions = {};

    constructor(latlngs: L.LatLngExpression[] | L.LatLngExpression[][], options?: GeodesicOptions) {
        super();
        this.options = { ...this.options, ...options };
        const geom = new GeodesicGeometry();
        this.polyline = L.polyline(latlngs, this.options);
    }

    onAdd(map: L.Map): this {
        this.polyline.addTo(map);
        return this;
    }

    onRemove(): this {
        this.polyline.remove();
        return this;
    }

    setLatLngs(latlngs: L.LatLngExpression[] | L.LatLngExpression[][]): this {
        this.polyline.setLatLngs(latlngs);
        return this;
    }

    asPolyline(): L.LatLngExpression[] {
        console.log("[ Geodesic ]: asPolyline()");
        return [[0, 0] as L.LatLngExpression];
    }
}