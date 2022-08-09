// Protip: https://stackoverflow.com/questions/23429203/weird-behavior-with-objects-console-log
// import {csv} from "https://cdn.skypack.dev/d3-fetch@3"; // import just d3's csv capabilities without loading entire library

import { markerMergeV1, markerMergeV2, markerMergeV3, markerMergeV4, markerMergeV5, markerMergeV6, markerMergeV7 } from "./markerMerge.js";
import { getRandCoordsWithinCircle } from "./geometry/getRandCoordsWithinCircle.js";
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
                // maxZoom: 15
                // maxBoundsViscosity: 1.0
            }
            ).setView([37.439974, -15.117188], 1);
            
            this.map.on("zoom", () => {
                // console.log("view reset");
                markerManager.renderMarkers();
                
                // console.log(this.map.getZoom());
            })
            // https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png
            // https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
            // https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}{r}.{ext}
            // ^^^ this one has nice black and white scheme as required, but looks like tiles aren't available
            // once you get to zoom level ~3, throws bunch of errors in console.
            L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}{r}.png', {
                maxZoom: 12,
                minZoom: 3,
                noWrap: true,
                // https://stackoverflow.com/questions/47477956/nowrap-option-on-tilelayer-is-only-partially-working
                bounds: [ // stops leaflet from requesting tiles outside map bounds (causes HTTP 400)
                    [-90, -180],
                    [90, 180]
                ],
                attribution: '© OpenStreetMap'
            }).addTo(this.map);

            // const url = "../data/countries.geo.json";

            const fetchJson = async (url) => {
                try {
                    const data = await fetch(url);
                    const response = await data.json();  
                    return response;
                } catch (error) {
                    console.log(error);
                }
            };

            // const landGeoJSON = await fetchJson("../data/countries.geo.json");
            // L.geoJson(landGeoJSON, { // initialize layer with data
            //     style: {
            //         'weight': 1,
            //         'color': 'black',
            //         'fillColor': 'white',
            //         'fillOpacity': 0.9
            //     }
            // }).addTo(this.map); // Add layer to map

            // const waterGeoJSON = await fetchJson("../data/earth-waterbodies.geo.json");
            // L.geoJson(waterGeoJSON, { // initialize layer with data
            //     style: {
            //         'weight': 1,
            //         'color': 'black',
            //         'fillColor': 'black',
            //         'fillOpacity': 1
            //     }
            // }).addTo(this.map); // Add layer to map

            // fetch('../data/countries.geo.json', function (geojson) { // load file
            //     console.log("done")
            //     L.geoJson(geojson, { // initialize layer with data
            //         style: {
            //             'weight': 1,
            //             'color': 'black',
            //             'fillColor': 'yellow'
            //         }
            //     }).addTo(this.map); // Add layer to map
            // });
            

            // L.marker([51.5, 50]).addTo(this.map)
            //     .bindPopup('<img src="DesignBlogImage-1536x1097.jpg" height="200" width="200">', {
            //     })
            //     // .openPopup();

            // L.marker([51.5, 60]).addTo(this.map)
            //     .bindPopup('<img src="DesignBlogImage-1536x1097.jpg">', {
            //         maxHeight: 300,
            //         className: "map-popup-1"
            //     })

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
            
            // console.log(mrker.getContent())
                // .openPopup();

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
                let markers = [];
                for (let i = 0; i < uniqueCoordsKeys.length; i++) {
                    markers.push({
                        id: uniqueCoordsKeys[i],
                        coords: mapManager.map.latLngToContainerPoint([data[uniqueCoordsKeys[i]].lat, data[uniqueCoordsKeys[i]].lng]),
                        radius: data[uniqueCoordsKeys[i]].people.length + Math.log(mapManager.map.getZoom() * 100), // data[uniqueCoordsKeys[i]].people.length > 5 ? data[uniqueCoordsKeys[i]].people.length + mapManager.map.getZoom() * 0.5 : data[uniqueCoordsKeys[i]].people.length + 2 + mapManager.map.getZoom(),
                        people: data[uniqueCoordsKeys[i]].people,
                        members: [],
                        inGroup: false
                    });
                }
                const radiusOfMarkerRepresentingOnePerson = 1 + Math.log(mapManager.map.getZoom() * 100);
                markers = markerMergeV7(markers);
                // console.log(markers);
                
                // what's the radius of a marker representing 1 person?
                // Idea: At any zoom level, after merging, if marker reps just 1 person, make it clickable and show that person's info. 
                // else, for markers who rep N > 1 person, split them into N markers reping 1 person if: 
                // radius x 2 circle doesn't intersect with any markers?
                let splitMarkers = [];
                splitMarkers = markers;
                // console.log(markers[0]);
                // for (let i of markers) {
                //     // TODO: add additional rule determining if split occurs or not
                //     // assign bubbles coordinates such that no bubble overlaps
                //     let splitAllowed = true;
                //     const radiusOfCircleForSplitting = (i.radius * 2) + (i.people.length);
                //     for (let j of markers) {
                //         if (i.id === j.id) {
                //             continue;
                //         }
                //         const distance = getDistanceBetweenTwoPoints(i.coords, j.coords);
                //         let r1 = radiusOfCircleForSplitting;
                //         let r2 = j.radius;
                //         if (twoCirclesOverlap(r1, r2, distance)) {
                //             // console.log("no split");
                //             splitAllowed = false;
                //         }
                //     }
                //     if (i.people.length > 1 && splitAllowed) {
                        
                //         let splitBubbles = [];
                //         for (let person of i.people) {

                //             let coordRejected = true;
                //             let rand = null;
                //             let tries = 0;
                //             // coordinate of split bubble cannot result in overlap with another bubble
                //             while (coordRejected && tries != 1000) {
                //                 // coord is within a circle that has radius of original merged marker's radius * 2
                //                 rand = getRandCoordsWithinCircle(i.coords, radiusOfCircleForSplitting, false);
                //                 coordRejected = false;
                //                 for (let bubble of splitBubbles) {
                //                     const distance = getDistanceBetweenTwoPoints(bubble.coords, rand);
                //                     let r1 = bubble.radius;
                //                     let r2 = 10;
                //                     if (distance <= r1 - r2 || distance <= r2 - r1 || distance < r1 + r2 || distance == r1 + r2 || distance < 10) {
                //                         coordRejected = true;
                //                     } 
                //                 }
                //                 tries++;
                //                 // console.log(splitBubbles)
                //             }
                //             if (tries == 1000 && coordRejected) {
                //                 console.log(`acceptable position for marker #${splitBubbles.length + 1} could not be found within 1000 attempts for group: `, i)
                //                 splitAllowed = false;
                //                 break
                //             } else {
                //                 splitBubbles.push({
                //                     people: [person], 
                //                     radius: radiusOfMarkerRepresentingOnePerson,
                //                     coords: {
                //                         x: rand.x,
                //                         y: rand.y
                //                     }
                //                 });
                //             }
                            
                //         }
                //         // if (splitBubbles.length != i.people.length) {
                //         //     console.log(i, "fail")
                //         // }
                //         if (splitAllowed) {
                //             splitMarkers = splitMarkers.concat(splitBubbles);
                //             i.split = true;
                //         } else {
                //             splitMarkers.push(i);
                //             i.split = false;
                //         }
                //         // splitMarkers.push({
                //         //     people: [person],
                //         //     radius: 10,
                //         //     coords: {
                //         //         x: i.coords.x + rand.x,
                //         //         y: i.coords.y + rand.y,
                //         //     }
                //         // })
                //     } else {
                //         i.split = false;
                //         splitMarkers.push(i);
                //     }
                // }
                
                // console.log(splitMarkers);

                // shows the circle that was used to generate the split markers.
                for (let i of markers) {
                    if (i.split) {
                        console.log("noep")
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
                        marker.bindPopup(`<p>${i}</p>`);
                        marker.addTo(mapManager.map);
                    }
                    
                }
    
                for (let i of splitMarkers) {
                    let marker = null;
                    if (i.people.length == 1) {
                        marker = new L.circleMarker(
                            mapManager.map.containerPointToLatLng(i.coords),
                            {
                                color: "blue",
                                radius: i.radius,
                                stroke: false,
                                fillOpacity: 0.7
                            }
                        )
                        marker.bindPopup(`<p>${i.people[0].name}</p>`);

                    } else {
                        marker = new L.circleMarker(
                            mapManager.map.containerPointToLatLng(i.coords),
                            {
                                color: "#FF5710",
                                radius: i.radius,
                                stroke: false,
                                fillOpacity: 0.9
                            }
                        )
                        marker.bindPopup(`<p>${i.people.length}</p>`);

                    }
                    this.markerDOMEles.push(marker);
                    marker.addTo(mapManager.map);
                }
                //     marker.on("click", (e) => {
                //         console.log("click")
                //         console.log(marker.getRadius());
                //         console.log(i.people);
                //         controller.setSelectedMarkerData(i);
                //     })
                //     // i.markerRef = marker;
                //     marker.on("mouseover", () => {
                //         // console.log("wat")
                //         marker.setStyle({fillColor: "#45CAFF"});
                //         // let tooltipPos = marker.getLatLng();
                //         // tooltipPos.lat += (marker.getRadius() * 0.00001);
                //         // console.log(latlng.lat);                    
                //         // marker.openPopup(tooltipPos);
                //     })

                //     marker.on("mouseout", () => {
                //         // console.log("wat")
                //         marker.setStyle({fillColor: "#FF5710"});
                //         // let tooltipPos = marker.getLatLng();
                //         // tooltipPos.lat += (marker.getRadius() * 0.00001);
                //         // console.log(latlng.lat);                    
                //         // marker.openPopup(tooltipPos);
                //     })
                    
                    
                //     this.markerDOMEles.push(marker);
                //     marker.addTo(mapManager.map);
                // }

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
                    // console.log(regionCounts);
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