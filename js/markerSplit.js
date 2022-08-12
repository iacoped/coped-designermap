import { getRandCoordsWithinCircle } from "./geometry/getRandCoordsWithinCircle.js";
import { getDistanceBetweenTwoPoints } from "./geometry/getDistanceBetweenTwoPoints.js";
import { getTwoCirclesIntersectionInfo } from "./geometry/getTwoCirclesIntersectionInfo.js";
/** 
* splits a marker representing N indiviudals into N markers each representing 1 individual.
* @summary If the description is long, write your summary here. Otherwise, feel free to remove this.
* @param {ParamDataTypeHere} parameterNameHere - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
* @return {ReturnValueDataTypeHere} Brief description of the returning value here.
*/


// what's the radius of a marker representing 1 person?
// Idea: At any zoom level, after merging, if marker reps just 1 person, make it clickable and show that person's info. 
// else, for markers who rep N > 1 person, split them into N markers reping 1 person if: 
// radius x 2 circle doesn't intersect with any markers?
/* 
    in my opinion, to be visually consistent, circle that already split into multiple markers at a 
    certain zoom level should not merge back at lower zoom levels. as you zoom in more and more,
    visual distance between latitude/longitudes (and thus marker positions) increases, so there is more
    physical space to split markers into single individual rep markers.So the info
    should get more and more specific as you zoom in more. The current algorithm is inconsistent at
    doing this.

*/
export function markerSplitV1(markers, radiusOfMarkerRepresentingOnePerson) {

    let splitMarkers = [];
    for (let i of markers) {
        // TODO: add additional rule determining if split occurs or not
        // assign bubbles coordinates such that no bubble overlaps
        let splitAllowed = true;
        const radiusOfCircleForSplitting = (i.radius * 2) + (i.people.length);
        for (let j of markers) {
            if (i.id === j.id) {
                continue;
            }
            const distance = getDistanceBetweenTwoPoints(i.coords, j.coords);
            let r1 = radiusOfCircleForSplitting;
            let r2 = j.radius;
            const intersectionInfo = getTwoCirclesIntersectionInfo(r1, r2, distance);
            if (intersectionInfo.intersects) {
                // console.log("no split");
                splitAllowed = false;
            }
        }
        if (i.people.length > 1 && splitAllowed) {
            
            let splitBubbles = [];
            for (let person of i.people) {

                let coordRejected = true;
                let rand = null;
                let tries = 0;
                // coordinate of split bubble cannot result in overlap with another bubble
                while (coordRejected && tries != 1000) {
                    // coord is within a circle that has radius of original merged marker's radius * 2
                    rand = getRandCoordsWithinCircle(i.coords, radiusOfCircleForSplitting, false);
                    coordRejected = false;
                    for (let bubble of splitBubbles) {
                        const distance = getDistanceBetweenTwoPoints(bubble.coords, rand);
                        let r1 = bubble.radius;
                        let r2 = 10;
                        if (distance <= r1 - r2 || distance <= r2 - r1 || distance < r1 + r2 || distance == r1 + r2 || distance < 10) {
                            coordRejected = true;
                        } 
                    }
                    tries++;
                    // console.log(splitBubbles)
                }
                if (tries == 1000 && coordRejected) {
                    console.log(`acceptable position for marker #${splitBubbles.length + 1} could not be found within 1000 attempts for group: `, i)
                    splitAllowed = false;
                    break
                } else {
                    splitBubbles.push({
                        people: [person], 
                        radius: radiusOfMarkerRepresentingOnePerson,
                        coords: {
                            x: rand.x,
                            y: rand.y
                        }
                    });
                }
                
            }
            // if (splitBubbles.length != i.people.length) {
            //     console.log(i, "fail")
            // }
            if (splitAllowed) {
                splitMarkers = splitMarkers.concat(splitBubbles);
                i.split = true;
            } else {
                splitMarkers.push(i);
                i.split = false;
            }
            // splitMarkers.push({
            //     people: [person],
            //     radius: 10,
            //     coords: {
            //         x: i.coords.x + rand.x,
            //         y: i.coords.y + rand.y,
            //     }
            // })
        } else {
            i.split = false;
            splitMarkers.push(i);
        }
    }
    return splitMarkers;
}

// for circles who are not split but were part of a circle that was split last time, merge and split them?
// 
export function markerSplitV2(newMarkers, oldMarkers, radiusOfMarkerRepresentingOnePerson) {
    console.log("new markers: ", newMarkers);
    console.log("old markers: ", oldMarkers);
    let splitMarkers = [];
    for (let i of newMarkers) {
        // TODO: add additional rule determining if split occurs or not
        // assign bubbles coordinates such that no bubble overlaps
        let splitAllowed = true;
        const radiusOfCircleForSplitting = (i.radius * 2) + (i.people.length);
        for (let j of newMarkers) {
            if (i.id === j.id) {
                continue;
            }
            const distance = getDistanceBetweenTwoPoints(i.coords, j.coords);
            let r1 = radiusOfCircleForSplitting;
            let r2 = j.radius;
            const intersectionInfo = getTwoCirclesIntersectionInfo(r1, r2, distance);
            if (intersectionInfo.intersects) {
                // console.log("no split");
                splitAllowed = false;
            }
        }
        if (i.people.length > 1 && splitAllowed) {
            
            let splitBubbles = [];
            for (let person of i.people) {

                let coordRejected = true;
                let rand = null;
                let tries = 0;
                // coordinate of split bubble cannot result in overlap with another bubble
                while (coordRejected && tries != 1000) {
                    // coord is within a circle that has radius of original merged marker's radius * 2
                    rand = getRandCoordsWithinCircle(i.coords, radiusOfCircleForSplitting, false);
                    coordRejected = false;
                    for (let bubble of splitBubbles) {
                        const distance = getDistanceBetweenTwoPoints(bubble.coords, rand);
                        let r1 = bubble.radius;
                        let r2 = 10;
                        if (distance <= r1 - r2 || distance <= r2 - r1 || distance < r1 + r2 || distance == r1 + r2 || distance < 10) {
                            coordRejected = true;
                        } 
                    }
                    tries++;
                    // console.log(splitBubbles)
                }
                if (tries == 1000 && coordRejected) {
                    console.log(`acceptable position for marker #${splitBubbles.length + 1} could not be found within 1000 attempts for group: `, i)
                    splitAllowed = false;
                    break
                } else {
                    splitBubbles.push({
                        name: person.name,
                        radius: radiusOfMarkerRepresentingOnePerson,
                        coords: {
                            x: rand.x,
                            y: rand.y
                        }
                    });
                }
                
            }
            // if (splitBubbles.length != i.people.length) {
            //     console.log(i, "fail")
            // }
            if (splitAllowed) {
                if (i.splitBubbles === undefined) {
                    i.splitBubbles = [];
                } 
                i.splitBubbles = i.splitBubbles.concat(splitBubbles);
                i.split = true;
            } else {
                i.split = false;
            }
            splitMarkers.push(i);

        } else {
            i.split = false;
            splitMarkers.push(i);
        }
    }
    return splitMarkers;
}

// for circles who are not split but were part of a circle that was split last time, merge and split them?
// 
export function markerSplitV3(newMarkers, radiusOfMarkerRepresentingOnePerson) {
    let splitMarkers = [];
    for (let i of newMarkers) {
        if (i.inGroup) {
            splitMarkers.push(i);
            continue;
        }
        // TODO: add additional rule determining if split occurs or not
        // assign bubbles coordinates such that no bubble overlaps
        let splitAllowed = true;
        const radiusOfCircleForSplitting = (i.radius * 2) + (i.people.length);
        for (let j of newMarkers) {
            if (j.inGroup || i.id === j.id) {
                continue;
            }
            const distance = getDistanceBetweenTwoPoints(i.coords, j.coords);
            let r1 = radiusOfCircleForSplitting;
            let r2 = j.radius;
            const intersectionInfo = getTwoCirclesIntersectionInfo(r1, r2, distance);
            if (intersectionInfo.intersects) {
                // console.log("no split");
                splitAllowed = false;
            }
        }
        if (i.people.length > 1 && splitAllowed) {
            
            let splitBubbles = [];
            for (let person of i.people) {

                let coordRejected = true;
                let rand = null;
                let tries = 0;
                // coordinate of split bubble cannot result in overlap with another bubble
                while (coordRejected && tries != 1000) {
                    // coord is within a circle that has radius of original merged marker's radius * 2
                    rand = getRandCoordsWithinCircle(i.coords, radiusOfCircleForSplitting, false);
                    coordRejected = false;
                    for (let bubble of splitBubbles) {
                        const distance = getDistanceBetweenTwoPoints(bubble.coords, rand);
                        let r1 = bubble.radius;
                        let r2 = 10;
                        if (distance <= r1 - r2 || distance <= r2 - r1 || distance < r1 + r2 || distance == r1 + r2 || distance < 10) {
                            coordRejected = true;
                        } 
                    }
                    tries++;
                    // console.log(splitBubbles)
                }
                if (tries == 1000 && coordRejected) {
                    console.log(`acceptable position for marker #${splitBubbles.length + 1} could not be found within 1000 attempts for group: `, i)
                    splitAllowed = false;
                    break
                } else {
                    splitBubbles.push({
                        name: person.name,
                        radius: radiusOfMarkerRepresentingOnePerson,
                        coords: {
                            x: rand.x,
                            y: rand.y
                        }
                    });
                }
                
            }
            // if (splitBubbles.length != i.people.length) {
            //     console.log(i, "fail")
            // }
            if (splitAllowed) {
                if (i.splitBubbles === undefined) {
                    i.splitBubbles = [];
                } 
                i.splitBubbles = i.splitBubbles.concat(splitBubbles);
                i.split = true;
            } else {
                i.split = false;
            }
            splitMarkers.push(i);

        } else {
            i.split = false;
            splitMarkers.push(i);
        }
    }
    for (let i of splitMarkers) {

    }
    return splitMarkers;
}