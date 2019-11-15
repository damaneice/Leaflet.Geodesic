/**
 * @jest-environment jsdom
 */
import L from "leaflet";
import { GeodesicOptions } from "../src/geodesic-core"
import { GeodesicLine } from "../src/geodesic-line";
import { readFileSync } from "fs";
import { expect } from "chai";
import { latlngExpressionArraytoLiteralArray } from "../src/types-helper";

import "jest";

// test case with distance 54972.271 m
const FlindersPeak: L.LatLngLiteral = { lat: -37.9510334166667, lng: 144.424867888889 };
const Buninyong: L.LatLngLiteral = { lat: -37.6528211388889, lng: 143.926495527778 };

const Berlin: L.LatLngLiteral = { lat: 52.5, lng: 13.35 };
const Seattle: L.LatLngLiteral = { lat: 47.56, lng: -122.33 };
const Capetown: L.LatLngLiteral = { lat: -33.94, lng: 18.39 };
const LosAngeles: L.LatLngLiteral = { lat: 33.82, lng: -118.38 };
const Santiago: L.LatLngLiteral = { lat: -33.44, lng: -70.71 };

const fixturesPath = "spec/fixtures/";

const defaultOptions: GeodesicOptions = { wrap: true, steps: 3 };
const eps = 0.000001;

function checkFixture(specimen: L.LatLngLiteral[][], fixture: L.LatLngLiteral[][]): void {
    expect(specimen).to.be.an("array");
    expect(specimen).to.be.length(fixture.length);
    specimen.forEach((line, k) => {
        expect(line).to.be.length(fixture[k].length);
        line.forEach((point, l) => {
            expect(point).to.be.an("object");
            expect(point).to.include.all.keys("lat", "lng");
            expect(point.lat).to.be.closeTo(fixture[k][l].lat, eps);
            expect(point.lng).to.be.closeTo(fixture[k][l].lng, eps);
        });
    });
}

describe("Main functionality", function () {
    let map: L.Map;

    beforeEach(function () {
        map = L.map(document.createElement('div'));
    });

    afterEach(function () {
        map.remove();
    });

    it("Create class w/o any parameters", function () {
        const line = new GeodesicLine();
        expect(line.options).to.be.deep.equal(defaultOptions);
    });

    it("Create class with parameters", function () {
        const line = new GeodesicLine([], { steps: 0 });
        expect(line.options).to.be.deep.equal({ ...defaultOptions, ...{ steps: 0 } });
    });

    it("Create class with parameters", function () {
        const line = new GeodesicLine([], { wrap: false });
        expect(line.options).to.be.deep.equal({ ...defaultOptions, ...{ wrap: false } });
    });

    it("Add empty line to map", async function () {
        const line = new GeodesicLine().addTo(map);
        expect(line.options).to.be.deep.equal(defaultOptions);
        expect(line.polyline).to.be.an("object");

        expect(map.hasLayer(line)).to.be.true;
        map.eachLayer(function (layer) {
            expect(layer).to.be.instanceOf(GeodesicLine);
        });
    });

    it("Modify Line", async function () {
        const line = new GeodesicLine().addTo(map);
        expect(line.options).to.be.deep.equal(defaultOptions);
        expect(line.polyline).to.be.an("object");
        expect(map.hasLayer(line)).to.be.true;
        map.eachLayer(function (layer) {
            expect(layer).to.be.instanceOf(GeodesicLine);
        });
        line.setLatLngs([Berlin, Capetown]);
    });

    it("Modify Line w/o wrapping", async function () {
        const line = new GeodesicLine([], { wrap: false }).addTo(map);
        expect(line.options).to.be.deep.equal({ ...defaultOptions, ...{ wrap: false } });
        expect(line.polyline).to.be.an("object");
        expect(map.hasLayer(line)).to.be.true;
        map.eachLayer(function (layer) {
            expect(layer).to.be.instanceOf(GeodesicLine);
        });
        line.setLatLngs([Berlin, Capetown]);
    });

    it("Read LatLngs", async function () {
        const line = new GeodesicLine().addTo(map);
        expect(line.options).to.be.deep.equal(defaultOptions);
        expect(line.polyline).to.be.an("object");
        expect(map.hasLayer(line)).to.be.true;
        map.eachLayer(function (layer) {
            expect(layer).to.be.instanceOf(GeodesicLine);
        });
        const latlngs = line.getLatLngs();
        expect(latlngs).to.be.an("array");
    });

    it("Read LatLngs", async function () {
        const line = new GeodesicLine().addTo(map);
        expect(line.options).to.be.deep.equal(defaultOptions);
        expect(line.polyline).to.be.an("object");
        expect(map.hasLayer(line)).to.be.true;
        map.eachLayer(function (layer) {
            expect(layer).to.be.instanceOf(GeodesicLine);
        });
        const latlngs = line.getLatLngs();
        expect(latlngs).to.be.an("array");
    });

    it("Statistics calculation (simple)", async function () {
        const line = new GeodesicLine([[Berlin, Seattle, Capetown]], { steps: 0 }).addTo(map);
        expect(line.statistics.totalDistance).to.be.closeTo(24569051.081048, eps);
        expect(line.statistics.distanceArray).to.be.an("array");
        expect(line.statistics.distanceArray).to.be.length(1);
        expect(line.statistics.points).to.be.equal(3);
        expect(line.statistics.vertices).to.be.equal(5);
    });

    it("Statistics calculation (complex)", async function () {
        const line = new GeodesicLine([[Berlin, LosAngeles], [Santiago, Capetown]], { steps: 1 }).addTo(map);
        expect(line.statistics.totalDistance).to.be.closeTo(17319123.023856, eps);
        expect(line.statistics.distanceArray).to.be.an("array");
        expect(line.statistics.distanceArray).to.be.length(2);
        expect(line.statistics.points).to.be.equal(4);
        expect(line.statistics.vertices).to.be.equal(10);
    });

    it("distance calculation", async function () {
        const line = new GeodesicLine();
        const distance = line.distance(FlindersPeak, Buninyong);
        expect(distance).to.be.closeTo(54972.271, 0.001);
    });    
});

describe("GeoJSON-Support", function () {
    let map: L.Map;
    const mockLog = jest.fn();
    console.log = mockLog;

    beforeEach(function () {
        map = L.map(document.createElement('div'));
        mockLog.mockClear();
    });

    afterEach(function () {
        map.remove();
    });

    it("Just a Linestring", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}geometry-line.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = latlngExpressionArraytoLiteralArray(line.getLatLngs() as L.LatLng[][]); // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")));
    });

    it("Feature with Linestring", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}feature-line.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = latlngExpressionArraytoLiteralArray(line.getLatLngs() as L.LatLng[][]); // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")));
    });

    it("FeatureCollection with LineString", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}line.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = latlngExpressionArraytoLiteralArray(line.getLatLngs() as L.LatLng[][]); // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")));
    });

    it("FeatureCollection with Polygon", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}polygon.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = latlngExpressionArraytoLiteralArray(line.getLatLngs() as L.LatLng[][]); // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")));
    });

    it("FeatureCollection with Polygon incl. hole", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}polygon-hole.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = latlngExpressionArraytoLiteralArray(line.getLatLngs() as L.LatLng[][]); // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}polygon-hole.fixture.json`, "utf8")));
    });

    it("FeatureCollection with MultiPoint", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}multipoint.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = latlngExpressionArraytoLiteralArray(line.getLatLngs() as L.LatLng[][]); // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")));
    });

    it("FeatureCollection with MultiLineString", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}multiline.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = latlngExpressionArraytoLiteralArray(line.getLatLngs() as L.LatLng[][]); // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}multiline.fixture.json`, "utf8")));
    });

    it("FeatureCollection with MultiPolygon", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}multipolygon.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = latlngExpressionArraytoLiteralArray(line.getLatLngs() as L.LatLng[][]); // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}multipolygon.fixture.json`, "utf8")));
    });

    it("FeatureCollection with LineString and MultiPolygon", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}line-multipolygon.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = latlngExpressionArraytoLiteralArray(line.getLatLngs() as L.LatLng[][]); // FIXME: This is NOT typesafe!!
        const fixture = [
            ...JSON.parse(readFileSync(`${fixturesPath}line.fixture.json`, "utf8")),
            ...JSON.parse(readFileSync(`${fixturesPath}multipolygon.fixture.json`, "utf8"))];
        checkFixture(latlngs, fixture);
    });

    it("FeatureCollection with Point", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}point.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = latlngExpressionArraytoLiteralArray(line.getLatLngs() as L.LatLng[][]); // FIXME: This is NOT typesafe!!
        expect(latlngs).to.be.an("array");
        expect(latlngs).to.be.length(0);
        expect(mockLog.mock.calls[0][0]).to.match(/Type "Point" not supported/);
    });

    it("Mixed FeatureCollection", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}mixed.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = latlngExpressionArraytoLiteralArray(line.getLatLngs() as L.LatLng[][]); // FIXME: This is NOT typesafe!!
        checkFixture(latlngs, JSON.parse(readFileSync(`${fixturesPath}mixed.fixture.json`, "utf8")));
        expect(mockLog.mock.calls[0][0]).to.match(/Type "Point" not supported/);
    });

    it("GeometryCollection", async function () {
        const line = new GeodesicLine([], { steps: 0 }).addTo(map);
        const geojson: GeoJSON.GeoJSON = JSON.parse(readFileSync(`${fixturesPath}geometrycollection.geojson`, "utf8"));
        line.fromGeoJson(geojson);
        const latlngs = latlngExpressionArraytoLiteralArray(line.getLatLngs() as L.LatLng[][]); // FIXME: This is NOT typesafe!!
        expect(latlngs).to.be.an("array");
        expect(latlngs).to.be.length(0);
        expect(mockLog.mock.calls[0][0]).to.match(/Type "GeometryCollection" not supported/);
    });
});

describe("Re-Implementing Layer-Functions", function () {
    let map: L.Map;

    beforeEach(function () {
        map = L.map(document.createElement('div'));
    });

    afterEach(function () {
        map.remove();
    });

    it("getBounds()", async function () {
        const line = new GeodesicLine([FlindersPeak, Buninyong]);
        const group = new L.FeatureGroup([line]).addTo(map);

        expect(line.options).to.be.deep.equal(defaultOptions);
        expect(line.polyline).to.be.an("object");

        expect(map.hasLayer(group)).to.be.true;
        map.eachLayer(function (layer) {
            expect(layer).to.be.instanceOf(L.FeatureGroup);
        });

        const bounds = group.getBounds();
        expect(bounds).to.be.instanceOf(L.LatLngBounds);
        checkFixture([[bounds.getCenter()]], [[{lat: (FlindersPeak.lat+Buninyong.lat)/2, lng: (FlindersPeak.lng+Buninyong.lng)/2}]]);
    });
});