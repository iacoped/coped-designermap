// Protip: https://stackoverflow.com/questions/23429203/weird-behavior-with-objects-console-log
import {csv} from "https://cdn.skypack.dev/d3-fetch@3"; // import just d3's csv capabilities without loading entire library

import { markerMerge } from "./clusterAlgorithms/markerMerge.js";
import { markerSplit } from "./clusterAlgorithms/markerSplit.js";
import { fetchJson } from "./utils/ajax/fetchJson.js";
import { createDeepCopy } from "./utils/core/createDeepCopy.js";
import { getPointOnLineWithDistanceDirection } from "./utils/geometry/getPointOnLineWithDistanceDirection.js";
import { getDistanceBetweenTwoPoints } from "./utils/geometry/getDistanceBetweenTwoPoints.js";
import { designerInfoPopup } from "./components/designerInfoPopup.js";
(() => {
    'use strict';
    const model = {
        data: null,
    }

    const mapManager = {
        initialZoom: 3,
        minZoom: 2, 
        maxZoom: 15,

        initializeMap() {
            this.map = L.map('map', {
                preferCanvas: true,
                // physical distance between latlngs changes by a factor of ~2.
                zoomSnap: 1, 
                // worldCopyJump: true,
                maxBounds: [ 
                    [-90, -225],
                    [90, 225]
                ],
                maxBoundsViscosity: 1.0,
            }
            ).setView([34, -99], this.initialZoom); // centers map on US (most people there)

            L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}{r}.png', {
                maxZoom: this.maxZoom,
                minZoom: this.minZoom,
                // errorTileUrl: '../assets/images/pexels-photo-376723-909353127.png', // fallback image when tile isn't available is just a white image
                // https://stackoverflow.com/questions/47477956/nowrap-option-on-tilelayer-is-only-partially-working
                // bounds: [ // stops leaflet from requesting tiles outside map bounds (causes HTTP 400)
                //     [-90, -180],
                //     [90, 180]
                // ],
            })
            .addTo(this.map);
            
            L.control.attribution({
                position: 'bottomleft'
            })
            .addAttribution(`Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`)
            .addTo(this.map);
        },

        attachEventHandlersToMap() {
            // firing only on zoomend prevents constant marker re-rendering when zooming on mobile (plus it looks bad)
            this.map.on("zoomend", () => {
                markerManager.renderMarkers();
            });

            this.map.on("click", () => {
                mobileSidebarView.setDropdownState(false);
            })
        },

        // takes some time but isn't needed immediately, so I make it async
        async initializeGeoJSONLayers() {
            // https://gis.stackexchange.com/questions/380874/leaflet-draw-vector-layer-behind-tile-layer
            // https://leafletjs.com/examples/map-panes/
            // allows us to display the geoJSON layer behind the tile layer, so if a tile can't be loaded, the geoJSON is shown.
            this.map.createPane('fallbackPane'); 
            this.map.getPane('fallbackPane').style.zIndex = 0;

            // https://github.com/simonepri/geo-maps/blob/master/previews/earth-waterbodies.geo.json
            const landGeoJSON = await fetchJson("./data/countries.geo.json");
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

            // https://github.com/simonepri/geo-maps/blob/master/previews/earth-waterbodies.geo.json
            const waterGeoJSON = await fetchJson("./data/earth-waterbodies.geo.json");
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

        },
    }

    const markerManager = {
        markerDOMEles: [],
        singlePersonColor: "#7A7A89",
        multiplePersonColor: "#31939B",
        markersToRenderAtEachZoomLevel: {},
        popupCreatedFromClickingOnListItem: null,
        seededRNG: new Math.seedrandom('hello.'),
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

        manuallyShowPersonPopup(personToShowInfo) {
            for (const markerDOMEle of this.markerDOMEles) {
                for (const person of markerDOMEle.options.people) {
                    if (person.id === personToShowInfo.id) {
    
                        // if marker doesn't have popup (means it's representing multiple people, create one)
                        if (!markerDOMEle.getPopup()) {
                            this.popupCreatedFromClickingOnListItem = designerInfoPopup(personToShowInfo)
                                .setLatLng(markerDOMEle.getLatLng())
                                .openOn(mapManager.map);
                        } else {
                            markerDOMEle.openPopup();
                        }
                    }
                    
                }
            }
        },

        actuallyRenderMarkersOnMap(markers, offset) {
            const markerKeys = Object.keys(markers);
            for (let i of markerKeys) {
                const group = markers[i];

                if (!group.inGroup) {
                    let markerCoords = createDeepCopy(group.coords);

                    markerCoords.x += offset.xShiftAmount;
                    markerCoords.y += offset.yShiftAmount;
                    if (group.people.length == 1) {
                        let marker = new L.circleMarker(
                            mapManager.map.containerPointToLatLng(markerCoords),
                            {
                                fillColor: this.singlePersonColor,
                                color: "white",
                                weight: 1,
                                radius: group.radius,
                                fillOpacity: 1,
                                people: group.people
                            }
                        );
                        
                        marker.bindPopup(designerInfoPopup(group.people[0]));

                        this.markerDOMEles.push(marker);
                        marker.addTo(mapManager.map);
                    } else {
                        if (group.split) {
                            // shows the circle that was used to generate the split markers.
                            // if (true) {
                            //     let marker = new L.circleMarker(
                            //         mapManager.map.containerPointToLatLng(markerCoords),
                            //         {
                            //             color: "#FF5710",
                            //             radius: group.radius,
                            //             stroke: false,
                            //             fillOpacity: 0.9
                            //         }
                            //     )
                            //     this.markerDOMEles.push(marker);
                            //     marker.bindPopup(`<p>${group.people.length}</p>`);
                            //     marker.addTo(mapManager.map);
                            // }
                            
                            for (let subBubble of group.splitBubbles) {
                                let subBubbleCoords = createDeepCopy(subBubble.coords);
                                subBubbleCoords.x += offset.xShiftAmount;
                                subBubbleCoords.y += offset.yShiftAmount;

                                let marker = new L.circleMarker(
                                    mapManager.map.containerPointToLatLng(subBubbleCoords),
                                    {
                                        fillColor: this.singlePersonColor,
                                        color: "white",
                                        weight: 1,
                                        radius: subBubble.radius,
                                        fillOpacity: 1,
                                        people: [subBubble]
                                    }
                                )
                                marker.bindPopup(designerInfoPopup(subBubble));

                                this.markerDOMEles.push(marker);
                                marker.addTo(mapManager.map);
                            }
                            
                        } else {
                            let marker = new L.circleMarker(
                                mapManager.map.containerPointToLatLng(markerCoords),
                                {
                                    fillColor: this.multiplePersonColor,
                                    stroke: false,
                                    radius: group.radius,
                                    fillOpacity: 1,
                                    people: group.people
                                }
                            )

                            // do the zooming 
                            marker.on("click", (e) => {
                                let levelToZoomTo = null;
                                // searches for the closest higher zoom level its members become different or it splits into individuals (means it splits)
                                for (let zoomLevel = mapManager.map.getZoom() + 1; zoomLevel <= mapManager.maxZoom; zoomLevel++) {
                                    const groupAtZoomLevel = this.markersToRenderAtEachZoomLevel[zoomLevel][group.id];
                                    if (group.members.length != groupAtZoomLevel.members.length || groupAtZoomLevel.split) {
                                        // console.log("splits at", zoomLevel);
                                        levelToZoomTo = zoomLevel;
                                        break;
                                    }
                                }   
                                // use target's latlng instead of the latlng used to place the marker (they're different for some reason)
                                mapManager.map.setView(e.target.getLatLng(), levelToZoomTo);
                            })
                            this.markerDOMEles.push(marker);
                            marker.addTo(mapManager.map);
                        }
                    }
                }
            }
        },

        renderMarkers() {
            if (this.popupCreatedFromClickingOnListItem) {
                this.popupCreatedFromClickingOnListItem.remove();
                this.popupCreatedFromClickingOnListItem = null;
            }
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

            // I use a dict for easy lookup, I use Object.keys whenever I need to iterate.
            for (let i = mapManager.minZoom; i <= mapManager.maxZoom; i++) {
                this.markersToRenderAtEachZoomLevel[i] = {};
            }

            // what info is needed for the prediction? 
            let referenceInfo = [];
            for (let i = 0; i < uniqueCoordsKeys.length; i++) {
                let markerCoordsInPx = mapManager.map.latLngToContainerPoint([data[uniqueCoordsKeys[i]].lat, data[uniqueCoordsKeys[i]].lng]);

                const distance = getDistanceBetweenTwoPoints(refPointInPxCoords, markerCoordsInPx);

                referenceInfo.push({
                    distance: distance,
                    originalMarkerCoordsInPx: markerCoordsInPx,
                })
                
            }   

            // do the predictions
            let factor = 0;
            for (let zoomLevel = mapManager.minZoom; zoomLevel <= mapManager.maxZoom; zoomLevel++) {
                for (let j = 0; j < referenceInfo.length; j++) {
                    // Assuming a zoomSnap value of 1 (see line 27, the visual distance between markers increases by a factor of 2 each zoom level.)
                    let newDistance = referenceInfo[j].distance * (Math.pow(2, zoomLevel - mapManager.initialZoom));
                    const newMarkerCoordsInPx = getPointOnLineWithDistanceDirection(refPointInPxCoords, referenceInfo[j].originalMarkerCoordsInPx, newDistance);
                    
                    // if this key is already present, means it was already split at some lower zoom level.
                    // all that needs to be done is update the location of its child markers.
                    if (`group-${j}` in this.markersToRenderAtEachZoomLevel[zoomLevel]) {
                        const ref = this.markersToRenderAtEachZoomLevel[zoomLevel][`group-${j}`];
                        if (!ref.inGroup) {
                            ref.coords = newMarkerCoordsInPx;
                            const originalCoords = this.markersToRenderAtEachZoomLevel[ref.zoomLevelAtSplit][`group-${j}`].coords;
                            
                            const offset = {
                                xShiftAmount: originalCoords.x - ref.coords.x,
                                yShiftAmount: originalCoords.y - ref.coords.y
                            }

                            // somehow this works, figure out why later
                            for (let bubble of ref.splitBubbles) {
                                bubble.coords.x -= offset.xShiftAmount;
                                bubble.coords.y -= offset.yShiftAmount;
                            }
                        }
                        
                    } else {
                        this.markersToRenderAtEachZoomLevel[zoomLevel][`group-${j}`] = {
                            id: `group-${j}`,
                            coords: newMarkerCoordsInPx,
                            radius: data[uniqueCoordsKeys[j]].people.length + Math.log(zoomLevel * 100),
                            people: data[uniqueCoordsKeys[j]].people,
                            members: [`group-${j}`],
                            inGroup: false
                        };
                    }

                }   
                const radiusOfMarkerRepresentingOnePerson = 1 + Math.log(zoomLevel * 100);
                // merge markers
                this.markersToRenderAtEachZoomLevel[zoomLevel] = markerMerge(this.markersToRenderAtEachZoomLevel[zoomLevel]);
                this.markersToRenderAtEachZoomLevel[zoomLevel] = markerSplit(this.markersToRenderAtEachZoomLevel[zoomLevel], radiusOfMarkerRepresentingOnePerson, this.seededRNG);

                /* 
                    To be visually consistent, circle that has already split into multiple markers at a 
                    certain zoom level should not merge back at higher zoom levels. As you zoom in more and more,
                    visual distance between latitude/longitudes (and thus marker positions) increases, so there is more
                    physical space to split markers into single individual rep markers. So the info
                    should get more and more specific as you zoom in more. 
                */
                // if a marker is "split" and shows all info at a zoom level, its state stays the same at all higher zoom levels
                const keys = Object.keys(this.markersToRenderAtEachZoomLevel[zoomLevel]);
                for (let key of keys) {
                    if (this.markersToRenderAtEachZoomLevel[zoomLevel][key].static && !this.markersToRenderAtEachZoomLevel[zoomLevel][key].inGroup) {
                        for (let zoom = zoomLevel + 1; zoom <= mapManager.maxZoom; zoom++) { 
                            // console.log(this.markersToRenderAtEachZoomLevel[zoomLevel][key]);
                            this.markersToRenderAtEachZoomLevel[zoom][key] = createDeepCopy(this.markersToRenderAtEachZoomLevel[zoomLevel][key]);
                            const ref = this.markersToRenderAtEachZoomLevel[zoom][key];
                            ref.zoomLevelAtSplit = zoomLevel;

                            for (let member of ref.members) {
                                if (member === key) {
                                    continue;
                                }
                                this.markersToRenderAtEachZoomLevel[zoom][member] = {
                                    inGroup: true,
                                }
                            }
                        }
                    }
                }

                factor++;
            }
        },
    }

    const sidebarView = {
        init() {
            const listDOMEle = document.querySelector("#designer-list ul");
            const data = controller.getPeopleData();
            const keys = Object.keys(data);

            for (const key of keys) {
                const people = data[key].people;
                for (const person of people) {
                    let listItemDOMEle = document.createElement("li");
                    listItemDOMEle.textContent = person.name;
                    listItemDOMEle.addEventListener("click", () => {
                        markerManager.manuallyShowPersonPopup(person);
                    });
                    listDOMEle.appendChild(listItemDOMEle);
                }
            }
        },
    }

    const mobileSidebarView = {
        init() {
            let dropdownVisible = false;
            const dropdownToggleDOMEle = document.querySelector("#button-container");
            const dropdownDOMEle = document.querySelector("#dropdown");
            dropdownToggleDOMEle.addEventListener("click", () => {
                this.setDropdownState(!dropdownVisible);
                render();
            });

            const aboutDOMEle = document.querySelector("#about-toggler");
            const aboutArrowDOMEle = document.querySelector("#about-toggler img");
            let aboutVisible = false;
            const aboutContentDOMEle = document.querySelector("#mobile-about-map p");
            aboutDOMEle.addEventListener("click", () => {
                aboutVisible = !aboutVisible;
                designerListVisible = false;
                render();
            });

            const designerListDOMEle = document.querySelector("#designer-list-toggler");
            const designerListArrowDOMEle = document.querySelector("#designer-list-toggler img");
            let designerListVisible = false;
            const designerListContentDOMEle = document.querySelector("#mobile-designer-list ul");
            designerListDOMEle.addEventListener("click", () => {
                designerListVisible = !designerListVisible;
                aboutVisible = false;
                render();
            });

            // populate list
            const listDOMEle = document.querySelector("#mobile-designer-list ul");
            const data = controller.getPeopleData();
            const keys = Object.keys(data);

            for (const key of keys) {
                const people = data[key].people;
                for (const person of people) {
                    let listItemDOMEle = document.createElement("li");
                    listItemDOMEle.textContent = person.name;
                    listItemDOMEle.addEventListener("click", () => {
                        dropdownVisible = false;
                        render();
                        markerManager.manuallyShowPersonPopup(person);
                    });
                    listDOMEle.appendChild(listItemDOMEle);
                }
            }

            function render() {
                dropdownDOMEle.style.display = dropdownVisible ? "flex" : "none";
                aboutContentDOMEle.style.display = aboutVisible ? "block" : "none";
                designerListContentDOMEle.style.display = designerListVisible ? "block" : "none";
                aboutArrowDOMEle.src = aboutVisible ? "./assets/images/arrow-up.svg" : "./assets/images/arrow-down.svg";
                designerListArrowDOMEle.src = designerListVisible ? "./assets/images/arrow-up.svg" : "./assets/images/arrow-down.svg";
            }
            // public but state variable is private
            this.setDropdownState = (state) => {
                dropdownVisible = state;
                render();
            };

            render();
        }
    }

    const controller = {
        async init() {
            this.setPeopleData(await this.loadAndProcessDataset());
            mapManager.initializeMap(); // this MUST execute before markerManager.init()
            mapManager.initializeGeoJSONLayers(); // async
            markerManager.init();
            mapManager.attachEventHandlersToMap();
            sidebarView.init();
            mobileSidebarView.init();
        },

        async loadAndProcessDataset() {
            const data = await csv("./data/CoPED advisory list 2021-1.csv");
            // data.sort((a,b) => b["Number"] - a["Number"]);

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
                const personData = {
                    // used to uniquely identify a person when they are selected in dropdown menu to see info
                    // b/c multiple people could have same names, can't use that to identify which person to show info
                    id: `${latlnString}-${uniqueCoords[latlnString].people.length}`, 
                    name: String(datum["Full Name"]),
                    universityAffiliation: datum["University affiliation"] ? String(datum["University affiliation"]) : "N/A",
                    communityAffiliation: datum["Community Affiliation"] ? String(datum["Community Affiliation"]) : "N/A",
                    organization: datum["Firm/Lab/Organization/\nCenter Name"] ? String(datum["Firm/Lab/Organization/\nCenter Name"]) : "N/A",
                    // links seem to work fine even with newlines in them, for correctness I suppose they could be removed
                    links: datum["link"] ? String(datum["link"]).split(",") : []
                }
                uniqueCoords[latlnString].people.push(personData)
            })

            return uniqueCoords;
        },

        getPeopleData() {
            return model.data;
        },

        setPeopleData(data) {
            model.data = data;
        },
    }
    
    controller.init();
})();
