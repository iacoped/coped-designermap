(async () => {

    const model = {
        data: null,
        selectedMarkerData: null
    }

    const mapManager = {
        init() {
            this.map = L.map('map', {
                preferCanvas: true,
            }
            ).setView([37.439974, -15.117188], 1);
        
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                minZoom: 2,
                
                attribution: '© OpenStreetMap'
            }).addTo(this.map);

            this.map.on("zoom", () => {
                // console.log("view reset");
                // console.log(controller.getPeopleData())
                markerManager.renderMarkers(controller.getPeopleData(), true);
                // console.log(this.map.getZoom());
            })

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

        renderMarkers(uniqueCoords, destroyExistingMarkers) {
            if (destroyExistingMarkers) {
                for (let i = 0; i < this.markerDOMEles.length; i++) {
                    this.markerDOMEles[i].removeFrom(mapManager.map);
                }
                this.markerDOMEles = [];
            }
            const uniqueCoordsKeys = Object.keys(uniqueCoords);

            arrForCheckingIntersections = [];
            for (let i = 0; i < uniqueCoordsKeys.length; i++) {
                let popupContent = `${uniqueCoords[uniqueCoordsKeys[i]].people.length}`;
                
                // console.log(mapManager.map.latLngToContainerPoint([uniqueCoords[uniqueCoordsKeys[i]].lat, uniqueCoords[uniqueCoordsKeys[i]].lng]));
                let marker = new L.circleMarker(
                    [uniqueCoords[uniqueCoordsKeys[i]].lat, uniqueCoords[uniqueCoordsKeys[i]].lng],
                    {
                        color: "#FF5710",
                        radius: uniqueCoords[uniqueCoordsKeys[i]].circleRadius + mapManager.map.getZoom(),
                        stroke: false,
                        fillOpacity: 0.5
                    }
                )
                arrForCheckingIntersections.push({
                    coords: mapManager.map.latLngToContainerPoint([uniqueCoords[uniqueCoordsKeys[i]].lat, uniqueCoords[uniqueCoordsKeys[i]].lng]),
                    radius: marker.getRadius(),
                    markerRef: marker
                });
                // marker.bindPopup(popupContent);

                this.markerDOMEles.push(marker);

                marker.addTo(mapManager.map);
                // marker.on("add", () => {
                //     console.log("added to map")
                // })

                marker.on("click", (e) => {
                    // if (marker.isPopupOpen()) {
                    //     marker.closePopup();
                    // }
                    console.log(marker.toGeoJSON());
                    controller.setSelectedMarkerData(uniqueCoords[uniqueCoordsKeys[i]]);
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

    
                
            }
            // check for any intersections (could be optimized?)
            for (let i of arrForCheckingIntersections) {
                // console.log(i)
                for (let j of arrForCheckingIntersections) {
                    if (i === j) {
                        continue;
                    }
                    const distance = Math.sqrt(Math.pow(i.coords.x - j.coords.x, 2) + Math.pow(i.coords.y - j.coords.y, 2));
                    // console.log(distance);
                    const r1 = i.radius;
                    const r2 = j.radius;
                    if (distance <= r1 - r2) {
                        i.markerRef.setStyle({fillColor: "black"});
                        j.markerRef.setStyle({fillColor: "black"});
                        // console.log("Circle B is inside A");
                    }
                    else if (distance <= r2 - r1) {
                        i.markerRef.setStyle({fillColor: "black"});
                        j.markerRef.setStyle({fillColor: "black"});
                        // console.log("Circle A is inside B");
                    }
                    else if (distance < r1 + r2) {
                        i.markerRef.setStyle({fillColor: "black"});
                        j.markerRef.setStyle({fillColor: "black"});
                        // console.log("Circle intersect to each other");
                    }
                    else if (distance == r1 + r2) {
                        // console.log("Circle touch to each other");
                    }
                    else {
                        // console.log("Circle not touch to each other");
                    }
                    // if () {
                        
                    // }
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
            this.render();
        },

        render() {
            const data = controller.getSelectedMarkerData();
            console.log(data);
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
            let uniqueCoords = {};
            data.forEach(datum => {
                // console.log(datum)
                const latlnString = `${datum["Latitude"]}, ${datum["Longitude"]}`;
                if (!(latlnString in uniqueCoords)) {
                    uniqueCoords[latlnString] = {
                        lat: datum["Latitude"],
                        lng: datum["Longitude"],
                        circleRadius: 0,
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
                uniqueCoords[latlnString].circleRadius++;
                
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
        }
    }
    
    

    
    controller.init();
})();