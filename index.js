// Protip: https://stackoverflow.com/questions/23429203/weird-behavior-with-objects-console-log
(() => {
    'use strict';
    const model = {
        data: null,
        selectedMarkerData: null,
        markerViewMode: "overlap"
    }

    // perhaps I will combine mapManager and markerManager into mapView since markers are on the mapview
    const mapManager = {
        init() {
            this.map = L.map('map', {
                preferCanvas: true,
            }
            ).setView([37.439974, -15.117188], 1);
            
            this.map.on("zoom", () => {
                console.log("view reset");
                markerManager.renderMarkers();
                // console.log(this.map.getZoom());
            })

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                minZoom: 2,
                
                attribution: '© OpenStreetMap'
            }).addTo(this.map);

            

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
                let arrForCheckingIntersections = [];
                // let mergedMarkers = [];
                for (let i = 0; i < uniqueCoordsKeys.length; i++) {
                    arrForCheckingIntersections.push({
                        id: uniqueCoordsKeys[i],
                        coords: mapManager.map.latLngToContainerPoint([data[uniqueCoordsKeys[i]].lat, data[uniqueCoordsKeys[i]].lng]),
                        radius: data[uniqueCoordsKeys[i]].people.length + mapManager.map.getZoom(),
                        people: data[uniqueCoordsKeys[i]].people,
                        members: [],
                        inGroup: false
                    });
                }
                
                // While intersections still exist:
                //   1. for each marker m1 that is not in a group:
                //      1. find any markers m2 that are not in a group and m1 != m2, combine them into merged marker (add radius, find midpoint of i and marker)
                //      2. mark intersecting markers as "merged" already (they should not be considered anymore)
                //      3. don't mark i as merged (merged marker might end up intersecting with it in future)
                // let i = 0;
                let intersectionsStillExist = true; 
                while (intersectionsStillExist) {
                    intersectionsStillExist = false;
                    // console.log(arrForCheckingIntersections);
                    for (let i of arrForCheckingIntersections) {
                        if (i.inGroup) {
                            continue;
                        }
                        // let mergedMarker = JSON.parse(JSON.stringify(i));
                        // mergedMarker.merged = false;
                        // i.merged = true;
                        for (let j of arrForCheckingIntersections) {
                            // if they are the same or already in the same group, don't compare it
                            if (i.id === j.id || j.inGroup) {
                                continue;
                            }
                            // logic for computing intersection
                            const distance = Math.sqrt(Math.pow(i.coords.x - j.coords.x, 2) + Math.pow(i.coords.y - j.coords.y, 2));
                            let r1 = i.radius;
                            let r2 = j.radius;
                            if (distance <= r1 - r2 || distance <= r2 - r1 || distance < r1 + r2 || distance == r1 + r2) {
                                intersectionsStillExist = true;
                                // decide rules for the new marker groups size and position
                                if (i.radius > j.radius) {
                                    i.members.push(j.id);
                                    // i.members = i.members.concat(j.members);
                                    i.people = i.people.concat(j.people);
                                    // j.members = [];
                                    j.inGroup = true;
                                    i.radius += 1;
                                } else {
                                    j.members.push(i.id);
                                    // i.members = i.members.concat(j.members);
                                    j.people = j.people.concat(i.people);
                                    // j.members = [];
                                    i.inGroup = true;
                                    j.radius += 1;
                                }
                                // i.radius = i.radius + 1;
                                // const midpoint = {
                                //     x: (i.coords.x + j.coords.x) / 2,
                                //     y: (i.coords.y + j.coords.y) / 2
                                // }
                                // i.coords.x = midpoint.x;
                                // i.coords.y = midpoint.y;
                                
                
                                
                            }  
                        }
                    }
                }
                // all the markers that are marked inGroup are already part of a group
                arrForCheckingIntersections = arrForCheckingIntersections.filter(markerGroup => !markerGroup.inGroup);
                console.log(arrForCheckingIntersections)
                for (let i of arrForCheckingIntersections) {
                    let marker = new L.circleMarker(
                        mapManager.map.containerPointToLatLng(i.coords),
                        {
                            color: "#FF5710",
                            radius: i.radius,
                            stroke: false,
                            fillOpacity: 0.5
                        }
                    )
                    marker.on("click", (e) => {
                        console.log("click")
                        controller.setSelectedMarkerData(i);
                    })
                    // i.markerRef = marker;
                    marker.on("mouseover", () => {
                        // console.log("wat")
                        marker.setStyle({fillColor: "#45CAFF"});
                        // let tooltipPos = marker.getLatLng();
                        // tooltipPos.lat += (marker.getRadius() * 0.00001);
                        // console.log(latlng.lat);                    
                        // marker.openPopup(tooltipPos);
                    })

                    marker.on("mouseout", () => {
                        // console.log("wat")
                        marker.setStyle({fillColor: "#FF5710"});
                        // let tooltipPos = marker.getLatLng();
                        // tooltipPos.lat += (marker.getRadius() * 0.00001);
                        // console.log(latlng.lat);                    
                        // marker.openPopup(tooltipPos);
                    })
                    this.markerDOMEles.push(marker);
                    marker.addTo(mapManager.map);
                }

            } else {
                for (let i = 0; i < uniqueCoordsKeys.length; i++) {
                    // let popupContent = `${uniqueCoords[uniqueCoordsKeys[i]].people.length}`;
                    
                    // console.log(mapManager.map.latLngToContainerPoint([uniqueCoords[uniqueCoordsKeys[i]].lat, uniqueCoords[uniqueCoordsKeys[i]].lng]));
                    let marker = new L.circleMarker(
                        [data[uniqueCoordsKeys[i]].lat, data[uniqueCoordsKeys[i]].lng],
                        {
                            color: "#FF5710",
                            radius: data[uniqueCoordsKeys[i]].people.length + mapManager.map.getZoom(),
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
                        controller.setSelectedMarkerData(data[uniqueCoordsKeys[i]]);
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
                console.log(data.people[index])
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
            // console.log(data);
            controlPanelView.dropdownDOMEle.innerHTML = "";
            if (!data) {
                controlPanelView.dropdownDOMEle.innerHTML = `<option value="" disabled selected>No location selected</option>`;
            } else {
                controlPanelView.dropdownDOMEle.innerHTML = `<option value="" disabled selected>Select a designer</option>`;
                // <option value="" disabled selected>Select your option</option>
                for (let j = 0; j < data.people.length; j++) {
                    const person = data.people[j];
                    let optionDOMEle = document.createElement("option");
                    optionDOMEle.value = `${person.id}`;
                    optionDOMEle.textContent = person.name;
                    controlPanelView.dropdownDOMEle.appendChild(optionDOMEle);
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
            const data = await d3.csv("./CoPED advisory list 2021-1.csv", d3.autoType);
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
                    affiliation: datum["Firm/Lab/Organization/\nCenter Name"],
                    discipline: datum["Discipline"],
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