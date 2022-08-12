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
// import { twoCirclesOverlap } from "./geometry/getTwoCirclesIntersectionInfo.js";
(() => {
    'use strict';
    const model = {
        data: null,
        selectedMarkerData: null,
        markerViewMode: "merge"
    }

    // perhaps I will combine mapManager and markerManager into mapView since markers are on the mapview
    const mapManager = {
        async init() {
            this.map = L.map('map', {
                preferCanvas: true,
                zoomSnap: 1
                // worldCopyJump: true,
                // maxZoom: 15
                // maxBoundsViscosity: 1.0
            }
            ).setView([37.439974, -15.117188], 1);
            
 
            // https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png
            // https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
            // https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}{r}.{ext}
            // ^^^ this one has nice black and white scheme as required, but looks like tiles aren't available
            // once you get to zoom level ~3, throws bunch of errors in console.

            const blackWhiteMap = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}{r}.png', {
                maxZoom: 12,
                minZoom: 3,
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

            let mrker = L.marker([0, -121.74])
                .addTo(this.map)
                .bindPopup(
                    `
                        <img src="./assets/images/DavisAmtrak.PNG" height="200" width="275">
                        <p>During the Spring Quarter of 2019 my Human-Centered Design class at UC Davis
                        worked with the city of Davis, CA to reimagine the Amtrak station and the surrounding
                        areas. I developed the project with Rachel Hartsough, the Arts and Culture Manager
                        for the City of Davis with the aim of supporting a larger study by the city to explore
                        ways to improve the station, decrease traffic congestion and encourage biking and
                        public transportation to and from the station. Utilizing a human-centered approach
                        to the challenge, the class interviewed potential users, developed a unique frame on
                        the challenge, then developed concepts, prototyped the ideas, tested them, and then
                        finally, presented their findings to a group of consultants and city officials at Davis City
                        Hall.</p>
                    `, 
                
                
                {
                    maxHeight: 300,
                    className: "map-popup-2"

                })
            
                // let marker1 = L.marker([0, -121.74])
                // .addTo(this.map)
                
                // let marker2 = L.marker([0, -130.74])
                // .addTo(this.map)

                let currDistance = null;
                // firing only on zoomend prevents constant re-rendering when zooming on mobile (plus it looks bad)
                // pixel distance between markers changes by factor of 2 on zoom (assuming zoom level changes by 1 each zoom)
                this.map.on("zoomend", () => {
                    // console.log("zoom");
                    markerManager.renderMarkers();
                    // let newDistance = getDistanceBetweenTwoPoints(this.map.latLngToContainerPoint(marker1.getLatLng()), this.map.latLngToContainerPoint(marker2.getLatLng()));
                    // console.log(currDistance, newDistance);
                    // if (currDistance) {
                    //     console.log(currDistance / newDistance);
                    // }
                    // currDistance = newDistance;
                    // console.log(this.map.getZoom());
                });
                
            // sometimes grey area happens, sometimes it doesn't, this hoepfully helps it guaranteed not problem
            // think the problem happens when I change the height of the map via css and live reloads the map
            // this code should prevent this from happening when resizing the map in the css
            //https://stackoverflow.com/questions/19564366/unwanted-gray-area-on-map
            setTimeout(this.map.invalidateSize.bind(this.map));
        }
    
        // function onMapClick(e) {
        //     popup
        //         .setLatLng(e.latlng)
        //         .setContent("You clicked the map at " + e.latlng.toString())
        //         .openOn(map);
        // }
        // // 38.579842, -481.48819
    }

    const markerManager = {
        markerDOMEles: [],
        markers: [],
        renderMarkers() {
            const data = controller.getPeopleData();
            if (true) { // maybe can consider not re-rendering if nothing changes
                for (let i = 0; i < this.markerDOMEles.length; i++) {
                    this.markerDOMEles[i].removeFrom(mapManager.map);
                }
                this.markerDOMEles = [];
            }
            const renderMode = controller.getMarkerViewMode();
            const uniqueCoordsKeys = Object.keys(data);
            if (renderMode === "merge") {
                let newMarkers = [];
                for (let i = 0; i < uniqueCoordsKeys.length; i++) {
                    newMarkers.push({
                        id: `group-${i}`,
                        coords: mapManager.map.latLngToContainerPoint([data[uniqueCoordsKeys[i]].lat, data[uniqueCoordsKeys[i]].lng]),
                        radius: data[uniqueCoordsKeys[i]].people.length + Math.log(mapManager.map.getZoom() * 100), // data[uniqueCoordsKeys[i]].people.length > 5 ? data[uniqueCoordsKeys[i]].people.length + mapManager.map.getZoom() * 0.5 : data[uniqueCoordsKeys[i]].people.length + 2 + mapManager.map.getZoom(),
                        people: data[uniqueCoordsKeys[i]].people,
                        members: [uniqueCoordsKeys[i]],
                        inGroup: false
                    });
                }
                
                newMarkers = markerMergeV8(newMarkers);

                newMarkers = markerSplitV3(newMarkers, 1 + Math.log(mapManager.map.getZoom() * 100));

                for (let i of newMarkers) {
                    if (!i.inGroup) {
                        if (i.people.length == 1) {
                            let marker = new L.circleMarker(
                                mapManager.map.containerPointToLatLng(i.coords),
                                {
                                    color: "blue",
                                    radius: i.radius,
                                    stroke: false,
                                    fillOpacity: 0.9
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
                                    mapManager.map.containerPointToLatLng(i.coords),
                                        {
                                            color: "orange",
                                            radius: (i.radius * 2) + i.people.length,
                                            stroke: false,
                                            fillOpacity: 0.7
                                        }
                                    )
                                    this.markerDOMEles.push(marker);
                                    marker.bindPopup(`<p>${i.people.length}</p>`);
                                    marker.addTo(mapManager.map);
                                }
                                
                                for (let subBubble of i.splitBubbles) {
                                    let marker = new L.circleMarker(
                                        mapManager.map.containerPointToLatLng(subBubble.coords),
                                        {
                                            color: "blue",
                                            radius: subBubble.radius,
                                            stroke: false,
                                            fillOpacity: 0.9
                                        }
                                    )
                                    marker.bindPopup(`<p>${subBubble.name}</p>`);
                                    this.markerDOMEles.push(marker);
                                    marker.addTo(mapManager.map);
                                }
                                
                            } else {
                                let marker = new L.circleMarker(
                                    mapManager.map.containerPointToLatLng(i.coords),
                                    {
                                        color: "#FF5710",
                                        radius: i.radius,
                                        stroke: false,
                                        fillOpacity: 0.9
                                    }
                                )

                                marker.bindPopup(`<p>${i.people.length}</p>`);
                                marker.on("click", (e) => {

                                    // some testing for centering on marker when clicked
                                    // let zoom = 4;
                                    // while (zoom <= 8) {
                                    //     console.log("wtf")
                                    //     mapManager.map.setView(e.target.getLatLng(), zoom++);
                                    //     // mapManager.map.setZoom();
                                    // }
                                    // mapManager.map.setView(e.target.getLatLng());
                                })
                                this.markerDOMEles.push(marker);
                                marker.addTo(mapManager.map);
                            }
                        }
                    }
                }

            } else {
                const markers = [];
                for (let i = 0; i < uniqueCoordsKeys.length; i++) {
                    markers.push({
                        id: uniqueCoordsKeys[i],
                        latlng: [data[uniqueCoordsKeys[i]].lat, data[uniqueCoordsKeys[i]].lng],
                        radius: data[uniqueCoordsKeys[i]].people.length + mapManager.map.getZoom(),
                        people: data[uniqueCoordsKeys[i]].people,
                    });
                }

                markers.forEach((marker) => {
                    const regionCounts = {
                        "fakeRegionForLogic": -Infinity
                    };
                    let mostCommonRegion = "fakeRegionForLogic";
                    for (let i = 0; i < marker.people.length; i++) {
                        const region = marker.people[i].region;
                        if (!(region in regionCounts)) {
                            regionCounts[region] = 1;
                        } else {
                            regionCounts[region]++;
                        }
                        if (regionCounts[region] > regionCounts[mostCommonRegion]) {
                            mostCommonRegion = region;
                        }
                    }
                    marker.mostCommonRegion = mostCommonRegion;
                })

                for (let i = 0; i < markers.length; i++) {
                    // console.log(mapManager.map.latLngToContainerPoint([uniqueCoords[uniqueCoordsKeys[i]].lat, uniqueCoords[uniqueCoordsKeys[i]].lng]));
                    let marker = new L.circleMarker(
                        markers[i].latlng,
                        {
                            color: "#FF5710",
                            radius: markers[i].people.length + mapManager.map.getZoom(),
                            stroke: false,
                            fillOpacity: 0.5
                        }
                    )
                    this.markerDOMEles.push(marker);

                    
                    // marker.on("add", () => {
                    //     console.log("added to map")
                    // })

                    marker.on("click", (e) => {
                        // if (marker.isPopupOpen()) {
                        //     marker.closePopup();
                        // }
                        controller.setSelectedMarkerData(markers[i]);
                    })

                    marker.on("mouseover", () => {
                        // console.log("wat")
                        marker.setStyle({fillColor: "#45CAFF"});
                        let tooltipPos = marker.getLatLng();
                        // tooltipPos.lat += (marker.getRadius() * 0.00001);
                        // console.log(latlng.lat);                    
                        // marker.openPopup(tooltipPos);
                    })

                    marker.on("mouseout", () => {
                        // console.log("wat")
                        marker.setStyle({fillColor: "#FF5710"});
                        let tooltipPos = marker.getLatLng();
                        // tooltipPos.lat += (marker.getRadius() * 0.00001);
                        // console.log(latlng.lat);                    
                        // marker.openPopup(tooltipPos);
                    })

                    marker.addTo(mapManager.map);
                }

                
            }
        }
    }

    const controlPanelView = {
        init() {
            this.regionDOMEle = document.querySelector("#region");
            this.dropdownDOMEle = document.querySelector("#people");
            this.dropdownDOMEle.addEventListener("change", (e) => {
                const data = controller.getSelectedMarkerData();
                // match person 
                let index = null;
                for (let i = 0; i < data.people.length; i++) {
                    if (e.target.value === data.people[i].id) {
                        index = i;
                        console.log("found")
                        break;
                    }
                }
                document.querySelector("#designer-info h2").innerHTML = data.people[index].name;
                document.querySelector("#designer-discipline p").innerHTML = data.people[index].discipline;
                document.querySelector("#designer-affiliation p").innerHTML = data.people[index].affiliation;
                document.querySelector("#designer-description #about-blurb-1").innerHTML = data.people[index].aboutBlurb1;
                document.querySelector("#designer-description #about-blurb-2").innerHTML = data.people[index].aboutBlurb2;
            })
            const radioButtons = document.querySelectorAll('input[name="marker-view-mode"]');
            for (const radioButton of radioButtons) {
                radioButton.addEventListener("click", () => {
                    if (radioButton.checked) {
                        controller.setMarkerViewMode(radioButton.value);
                    }
                });
            }
            
            this.render();
        },

        render() {
            const data = controller.getSelectedMarkerData();
            this.dropdownDOMEle.innerHTML = "";
            if (!data) {
                this.dropdownDOMEle.innerHTML = `<option value="" disabled selected>No location selected</option>`;
            } else {
                // only implemented in merge mode currently
                if (data.mostCommonRegion) {
                    this.regionDOMEle.innerHTML = data.mostCommonRegion;
                }
                this.dropdownDOMEle.innerHTML = `<option value="" disabled selected>Select a designer</option>`;
                // <option value="" disabled selected>Select your option</option>
                for (let j = 0; j < data.people.length; j++) {
                    const person = data.people[j];
                    let optionDOMEle = document.createElement("option");
                    optionDOMEle.value = `${person.id}`;
                    optionDOMEle.textContent = person.name;
                    this.dropdownDOMEle.appendChild(optionDOMEle);
                }
            }
            
        }
    }

    const controller = {
        async init() {
            this.setPeopleData(await this.loadAndProcessDataset());
            mapManager.init();
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
            console.log(uniqueCoords);
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