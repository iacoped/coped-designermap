// Protip: https://stackoverflow.com/questions/23429203/weird-behavior-with-objects-console-log
// import {csv} from "https://cdn.skypack.dev/d3-fetch@3"; // import just d3's csv capabilities without loading entire library

import { 
    markerMergeV1, 
    markerMergeV2, 
    markerMergeV3, 
    markerMergeV4, 
    markerMergeV5, 
    markerMergeV6, 
    markerMergeV7,
    markerMergeV8
} from "./markerMerge.js";
import { fetchJson } from "./ajax/fetchJson.js";
import { markerSplitV1, markerSplitV2, markerSplitV3 } from "./markerSplit.js";
import { getDistanceBetweenTwoPoints } from "./geometry/getDistanceBetweenTwoPoints.js";
import { getSlopeGivenTwoPoints } from "./geometry/getSlopeGivenTwoPoints.js";
import { getPointsOnSameSlope } from "./geometry/getPointsOnSameSlopeAndCertainDistanceAway.js";
// import { twoCirclesOverlap } from "./geometry/getTwoCirclesIntersectionInfo.js";
(() => {
    'use strict';
    const model = {
        data: null,
        selectedMarkerData: null,
        markerViewMode: "overlap-real-time"
    }

    // perhaps I will combine mapManager and markerManager into mapView since markers are on the mapview
    const mapManager = {
        minZoom: 3, 
        maxZoom: 12,
        currentZoomLevel: null,
        async init() {
            this.map = L.map('map', {
                preferCanvas: true,
                zoomSnap: 1
                // worldCopyJump: true,
                // maxZoom: 15
                // maxBoundsViscosity: 1.0
            }
            ).setView([37.439974, -15.117188], 3);
            
            this.currentZoomLevel = this.map.getZoom();
            // https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png
            // https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
            // https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}{r}.{ext}
            // ^^^ this one has nice black and white scheme as required, but looks like tiles aren't available
            // once you get to zoom level ~3, throws bunch of errors in console.

            const blackWhiteMap = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}{r}.png', {
                maxZoom: this.maxZoom,
                minZoom: this.minZoom,
                // errorTileUrl: '../assets/images/pexels-photo-376723-909353127.png', // fallback image when tile isn't available is just a white image
                noWrap: true,
                // https://stackoverflow.com/questions/47477956/nowrap-option-on-tilelayer-is-only-partially-working
                bounds: [ // stops leaflet from requesting tiles outside map bounds (causes HTTP 400)
                    [-90, -180],
                    [90, 180]
                ],
                attribution: '© OpenStreetMap'
            })
            // fires first
            .on("loading", () => {

            })
            // if it occurs, fires second
            .on("tileerror", () => {

            })
            // always fires last
            .on("load", () => {
                
            })
            .addTo(this.map);
        
            // https://gis.stackexchange.com/questions/380874/leaflet-draw-vector-layer-behind-tile-layer
            // https://leafletjs.com/examples/map-panes/
            // allows us to display the geoJSON layer behind the tile layer, so if a tile can't be loaded, the geoJSON is shown.
            this.map.createPane('fallbackPane'); // rename later
            this.map.getPane('fallbackPane').style.zIndex = 0;

            const landGeoJSON = await fetchJson("../data/countries.geo.json");
            const countriesLayer = L.geoJson(landGeoJSON, { // initialize layer with data
                pane: 'fallbackPane',
                style: {
                    'weight': 1,
                    'color': 'black',
                    'fillColor': 'white',
                    'fillOpacity': 1
                }
            });

            countriesLayer.addTo(this.map);

            const waterGeoJSON = await fetchJson("../data/earth-waterbodies.geo.json");
            const bodiesOfWaterLayer = L.geoJson(waterGeoJSON, { // initialize layer with data
                pane: 'fallbackPane',
                style: {
                    'weight': 1,
                    'color': 'black',
                    'fillColor': 'black',
                    'fillOpacity': 1
                }
            });

            bodiesOfWaterLayer.addTo(this.map);

            // let mrker = L.marker([0, -121.74])
            //     .addTo(this.map)
            //     .bindPopup(
            //         `
            //             <img src="./assets/images/DavisAmtrak.PNG" height="200" width="275">
            //             <p>During the Spring Quarter of 2019 my Human-Centered Design class at UC Davis
            //             worked with the city of Davis, CA to reimagine the Amtrak station and the surrounding
            //             areas. I developed the project with Rachel Hartsough, the Arts and Culture Manager
            //             for the City of Davis with the aim of supporting a larger study by the city to explore
            //             ways to improve the station, decrease traffic congestion and encourage biking and
            //             public transportation to and from the station. Utilizing a human-centered approach
            //             to the challenge, the class interviewed potential users, developed a unique frame on
            //             the challenge, then developed concepts, prototyped the ideas, tested them, and then
            //             finally, presented their findings to a group of consultants and city officials at Davis City
            //             Hall.</p>
            //         `, 
                
                
            //     {
            //         maxHeight: 300,
            //         className: "map-popup-2"

            //     })
            
            // firing only on zoomend prevents constant re-rendering when zooming on mobile (plus it looks bad)
            // pixel distance between markers changes by factor of 2 on zoom (assuming zoom level changes by 1 each zoom)
            this.map.on("zoomend", () => {
                markerManager.renderMarkers();
            });

            // sometimes grey area happens, sometimes it doesn't, this hoepfully helps it guaranteed not problem
            // think the problem happens when I change the height of the map via css and live reloads the map
            // this code should prevent this from happening when resizing the map in the css
            //https://stackoverflow.com/questions/19564366/unwanted-gray-area-on-map
            setTimeout(this.map.invalidateSize.bind(this.map));
        }
    }

    const markerManager = {
        markerDOMEles: [],

        markersToRenderAtEachZoomLevel: {},

        referencePoint: {
            posInLatLng: new L.LatLng(100, -40),
            posInPxCoordsAtStartUp: null
        },

        init() {
            this.computeMarkerStateAtEachZoomLevel();
            this.renderMarkers();
        },

        removeMarkersFromMap() {
            for (let i = 0; i < this.markerDOMEles.length; i++) {
                this.markerDOMEles[i].removeFrom(mapManager.map);
            }
            this.markerDOMEles = [];
        },

        // offset is only used with prediction method.
        actuallyRenderMarkersOnMap(markers, offset) {
            for (let i of markers) {
                let markerCoords = JSON.parse(JSON.stringify(i.coords));

                markerCoords.x += offset.xShiftAmount;
                markerCoords.y += offset.yShiftAmount;

                if (!i.inGroup) {
                    if (i.people.length == 1) {
                        let marker = new L.circleMarker(
                            mapManager.map.containerPointToLatLng(markerCoords),
                            {
                                color: "blue",
                                radius: i.radius,
                                stroke: false,
                                fillOpacity: 0.5
                            }
                        )
                        marker.bindPopup(`<p>${i.people[0].name}</p>`);
                        this.markerDOMEles.push(marker);
                        marker.addTo(mapManager.map);
                    } else {
                        if (i.split) {
                            // shows the circle that was used to generate the split markers.
                            if (true) {
                                let marker = new L.circleMarker(
                                    mapManager.map.containerPointToLatLng(markerCoords),
                                    {
                                        color: "#FF5710",
                                        radius: i.radius,
                                        stroke: false,
                                        fillOpacity: 0.9
                                    }
                                )
                                this.markerDOMEles.push(marker);
                                marker.bindPopup(`<p>${i.people.length}</p>`);
                                marker.addTo(mapManager.map);
                            }
                            
                            for (let subBubble of i.splitBubbles) {
                                let subBubbleCoords = JSON.parse(JSON.stringify(subBubble.coords));

                                subBubbleCoords.x += offset.xShiftAmount;
                                subBubbleCoords.y += offset.yShiftAmount;

                                let marker = new L.circleMarker(
                                    mapManager.map.containerPointToLatLng(subBubbleCoords),
                                    {
                                        color: "blue",
                                        radius: subBubble.radius,
                                        stroke: false,
                                        fillOpacity: 0.5
                                    }
                                )
                                marker.bindPopup(`<p>${subBubble.name}</p>`);
                                this.markerDOMEles.push(marker);
                                marker.addTo(mapManager.map);
                            }
                            
                        } else {
                            let marker = new L.circleMarker(
                                mapManager.map.containerPointToLatLng(markerCoords),
                                {
                                    color: "#FF5710",
                                    radius: i.radius,
                                    stroke: false,
                                    fillOpacity: 0.9
                                }
                            )

                            // marker.bindPopup(`<p>${i.people.length}</p>`);
                            // do the zooming 
                            marker.on("click", (e) => {

                            })
                            this.markerDOMEles.push(marker);
                            marker.addTo(mapManager.map);
                        }
                    }
                }
            }
        },

        renderMarkers() {
            this.removeMarkersFromMap();
            const currentZoomLevel = mapManager.map.getZoom();
            // the location of the reference point relative to the container will be different from its position on startup.
            // so need to offset all the markers by some amount to place them in the correct location.
            const refPointInPxCoords = mapManager.map.latLngToContainerPoint(this.referencePoint.posInLatLng);

            const offset = {
                xShiftAmount: refPointInPxCoords.x - this.referencePoint.posInPxCoordsAtStartUp.x,
                yShiftAmount: refPointInPxCoords.y - this.referencePoint.posInPxCoordsAtStartUp.y
            }
            this.actuallyRenderMarkersOnMap(this.markersToRenderAtEachZoomLevel[currentZoomLevel], offset);
        },

        // predicts the location, in pixel coordinates, of the markers at each zoom level.
        // somewhat inaccurate b/c some latlngs are close enough that px coordinates are the same, 
        // so predictions become inaccurate since they rely solely on rendering based on pixel coordinates.
        computeMarkerStateAtEachZoomLevel() {
            // distance in px between this and all markers computed
            const data = controller.getPeopleData();
            let refPointInPxCoords = mapManager.map.latLngToContainerPoint(this.referencePoint.posInLatLng);
            this.referencePoint.posInPxCoordsAtStartUp = refPointInPxCoords;

            const uniqueCoordsKeys = Object.keys(data);

            for (let i = mapManager.minZoom; i <= mapManager.maxZoom; i++) {
                this.markersToRenderAtEachZoomLevel[i] = [];
            }

            // what info is needed for the prediction? 
            let referenceInfo = [];
            for (let i = 0; i < uniqueCoordsKeys.length; i++) {
                let markerCoordsInPx = mapManager.map.latLngToContainerPoint([data[uniqueCoordsKeys[i]].lat, data[uniqueCoordsKeys[i]].lng]);

                const distance = getDistanceBetweenTwoPoints(refPointInPxCoords, markerCoordsInPx);
                let slope = undefined; 
                let directionToPlaceMarkerRelativeToReferencePoint;
                if (refPointInPxCoords.x == markerCoordsInPx.x && refPointInPxCoords.y == markerCoordsInPx.y) {
                    directionToPlaceMarkerRelativeToReferencePoint = "none";
                } else if (refPointInPxCoords.y == markerCoordsInPx.y) {
                    if (refPointInPxCoords.x > markerCoordsInPx.coords.x) {
                        directionToPlaceMarkerRelativeToReferencePoint = "to its left";
                    } else {
                        directionToPlaceMarkerRelativeToReferencePoint = "to its right";
                    }
                } else if (refPointInPxCoords.x == markerCoordsInPx.x) {
                    if (refPointInPxCoords.y > markerCoordsInPx.y) {
                        directionToPlaceMarkerRelativeToReferencePoint = "above it";
                    } else {
                        directionToPlaceMarkerRelativeToReferencePoint = "below it";
                    }
                } else {
                    slope = getSlopeGivenTwoPoints(refPointInPxCoords, markerCoordsInPx);
                    if (slope < 0 && refPointInPxCoords.x > markerCoordsInPx.x) {
                        directionToPlaceMarkerRelativeToReferencePoint = "its upper left";
                    } else if (slope < 0 && refPointInPxCoords.x < markerCoordsInPx.x) {
                        directionToPlaceMarkerRelativeToReferencePoint = "its bottom right";
                    } else if (slope > 0 && refPointInPxCoords.x < markerCoordsInPx.x) {
                        directionToPlaceMarkerRelativeToReferencePoint = "its upper right";
                    } else if (slope > 0 && refPointInPxCoords.x > markerCoordsInPx.x) {
                        directionToPlaceMarkerRelativeToReferencePoint = "its bottom left";
                    }
                }
                referenceInfo.push({
                    distance: distance,
                    slope: slope,
                    directionToPlaceMarkerRelativeToReferencePoint: directionToPlaceMarkerRelativeToReferencePoint,
                })
                
            }   

            // do the predictions
            let factor = 0;
            for (let zoomLevel = mapManager.minZoom; zoomLevel <= mapManager.maxZoom; zoomLevel++) {
                for (let j = 0; j < referenceInfo.length; j++) {
                    // px distance between markers should always increase as you zoom in
                    let newDistance = referenceInfo[j].distance * (Math.pow(2, factor));
                    let markerCoordsInPx;
                    if (referenceInfo[j].slope) {
                        const points = getPointsOnSameSlope(refPointInPxCoords, newDistance, referenceInfo[j].slope);
                        switch (referenceInfo[j].directionToPlaceMarkerRelativeToReferencePoint) {
                            case ("its upper left"):
                                markerCoordsInPx = points[1];
                                break;
                            case ("its bottom right"):
                                markerCoordsInPx = points[0];
                                break;
                            case ("its upper right"):
                                markerCoordsInPx = points[0];
                                break;
                            case ("its bottom left"):
                                markerCoordsInPx = points[1];
                                break;
                        }
                    } else {
                        switch (referenceInfo[j].directionToPlaceMarkerRelativeToReferencePoint) {
                            case ("none"): // marker is right on top of refPoint (very unlikely)
                                markerCoordsInPx = JSON.parse(JSON.stringify(refPointInPxCoords));
                                break;
                            case ("to its left"):
                                markerCoordsInPx = {
                                    x: refPointInPxCoords.x - newDistance,
                                    y: refPointInPxCoords.y
                                }
                                break;
                            case ("to its right"):
                                markerCoordsInPx = {
                                    x: refPointInPxCoords.x + newDistance,
                                    y: refPointInPxCoords.y
                                }
                                break;
                            case ("above it"):
                                markerCoordsInPx = {
                                    x: refPointInPxCoords.x,
                                    y: refPointInPxCoords.y + newDistance
                                }
                                break;
                            case ("below it"):
                                markerCoordsInPx = {
                                    x: refPointInPxCoords.x,
                                    y: refPointInPxCoords.y - newDistance
                                }
                                break;
                        }
                    }

                    this.markersToRenderAtEachZoomLevel[zoomLevel].push({
                        id: `group-${j}`,
                        coords: markerCoordsInPx,
                        radius: data[uniqueCoordsKeys[j]].people.length + Math.log(zoomLevel * 100),
                        people: data[uniqueCoordsKeys[j]].people,
                        members: [uniqueCoordsKeys[j]],
                        inGroup: false
                    });
                }   
                const radiusOfMarkerRepresentingOnePerson = 1 + Math.log(zoomLevel * 100);
                // merge markers
                this.markersToRenderAtEachZoomLevel[zoomLevel] = markerMergeV8(this.markersToRenderAtEachZoomLevel[zoomLevel]);
                this.markersToRenderAtEachZoomLevel[zoomLevel] = markerSplitV3(this.markersToRenderAtEachZoomLevel[zoomLevel], radiusOfMarkerRepresentingOnePerson);
                
                factor++;
            }
        },
    }

    const controlPanelView = {
        init() {
            // this.regionDOMEle = document.querySelector("#region");
            // this.dropdownDOMEle = document.querySelector("#people");
            // this.dropdownDOMEle.addEventListener("change", (e) => {
            //     const data = controller.getSelectedMarkerData();
            //     // match person 
            //     let index = null;
            //     for (let i = 0; i < data.people.length; i++) {
            //         if (e.target.value === data.people[i].id) {
            //             index = i;
            //             console.log("found")
            //             break;
            //         }
            //     }
            //     document.querySelector("#designer-info h2").innerHTML = data.people[index].name;
            //     document.querySelector("#designer-discipline p").innerHTML = data.people[index].discipline;
            //     document.querySelector("#designer-affiliation p").innerHTML = data.people[index].affiliation;
            //     document.querySelector("#designer-description #about-blurb-1").innerHTML = data.people[index].aboutBlurb1;
            //     document.querySelector("#designer-description #about-blurb-2").innerHTML = data.people[index].aboutBlurb2;
            // })
            // const radioButtons = document.querySelectorAll('input[name="marker-view-mode"]');
            // for (const radioButton of radioButtons) {
            //     radioButton.addEventListener("click", () => {
            //         if (radioButton.checked) {
            //             controller.setMarkerViewMode(radioButton.value);
            //         }
            //     });
            // }
            
            this.render();
        },

        render() {
            // const data = controller.getSelectedMarkerData();
            // this.dropdownDOMEle.innerHTML = "";
            // if (!data) {
            //     this.dropdownDOMEle.innerHTML = `<option value="" disabled selected>No location selected</option>`;
            // } else {
            //     // only implemented in merge mode currently
            //     if (data.mostCommonRegion) {
            //         this.regionDOMEle.innerHTML = data.mostCommonRegion;
            //     }
            //     this.dropdownDOMEle.innerHTML = `<option value="" disabled selected>Select a designer</option>`;
            //     // <option value="" disabled selected>Select your option</option>
            //     for (let j = 0; j < data.people.length; j++) {
            //         const person = data.people[j];
            //         let optionDOMEle = document.createElement("option");
            //         optionDOMEle.value = `${person.id}`;
            //         optionDOMEle.textContent = person.name;
            //         this.dropdownDOMEle.appendChild(optionDOMEle);
            //     }
            // }
            
        }
    }

    const controller = {
        async init() {
            this.setPeopleData(await this.loadAndProcessDataset());
            mapManager.init();
            markerManager.init();
            controlPanelView.init();
        },

        async loadAndProcessDataset() {
            const data = await d3.csv("./data/CoPED advisory list 2021-1.csv", d3.autoType);
            data.sort((a,b) => b["Number"] - a["Number"]);

            // group data based on latitude and longitude
            let uniqueCoords = {};
            data.forEach(datum => {
                const latlnString = `${datum["Latitude"]}, ${datum["Longitude"]}`;
                if (!(latlnString in uniqueCoords)) {
                    uniqueCoords[latlnString] = {
                        lat: datum["Latitude"],
                        lng: datum["Longitude"],
                        people: []
                    };
                }
                uniqueCoords[latlnString].people.push({
                    // used to uniquely identify a person when they are selected in dropdown menu to see info
                    // b/c multiple people could have same names, can't use that to identify which person to show info
                    id: `${latlnString}-${uniqueCoords[latlnString].people.length}`, 
                    name: datum["Full Name"],
                    discipline: datum["Discipline"],
                    affiliation: datum["Firm/Lab/Organization/\nCenter Name"],
                    region: datum["Region"],
                    aboutBlurb1: datum["notes"],
                    aboutBlurb2: datum["Possible Speakers"]
                })
                
            })
            return uniqueCoords;
        },

        getPeopleData() {
            return model.data;
        },

        setPeopleData(data) {
            model.data = data;
        },

        setSelectedMarkerData(data) {
            model.selectedMarkerData = data;
            controlPanelView.render();
        },

        getSelectedMarkerData() {
            return model.selectedMarkerData;
        },

        setMarkerViewMode(mode) {
            model.markerViewMode = mode;
            markerManager.renderMarkers();
        },

        getMarkerViewMode() {
            return model.markerViewMode;
        }
    }
    
    

    
    controller.init();
})();