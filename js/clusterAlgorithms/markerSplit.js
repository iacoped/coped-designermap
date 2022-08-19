import { getRandCoordsWithinCircle } from "../utils/geometry/getRandCoordsWithinCircle.js";
import { getDistanceBetweenTwoPoints } from "../utils/geometry/getDistanceBetweenTwoPoints.js";
import { getTwoCirclesIntersectionInfo } from "../utils/geometry/getTwoCirclesIntersectionInfo.js";
/** 
* splits a marker representing N indiviudals into N markers each representing 1 individual.
* @summary If the description is long, write your summary here. Otherwise, feel free to remove this.
* @param {ParamDataTypeHere} parameterNameHere - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
* @return {ReturnValueDataTypeHere} Brief description of the returning value here.
*/

// At any zoom level, after merging, if marker reps just 1 person, make it clickable and show that person's info. 
// else, for markers who rep N > 1 person, split them into N markers reping 1 person if: 
// radius x 2 circle doesn't intersect with any markers?

export function markerSplitV3(markers, radiusOfMarkerRepresentingOnePerson, seededRNG) {
    // let splitMarkers = [];
    const markerKeys = Object.keys(markers);
    for (let i of markerKeys) {
        const c1 = markers[i];
        if (c1.inGroup || c1.static) {
            // splitMarkers.push(c1);
            continue;
        }
        // TODO: add additional rule determining if split occurs or not
        // assign bubbles coordinates such that no bubble overlaps
        let splitAllowed = true;
        const radiusOfCircleForSplitting = (c1.radius * 2) + (c1.people.length);
        for (let j of markerKeys) {
            const c2 = markers[j];
            if (c2.inGroup || c1.id === c2.id) {
                continue;
            }
            const distance = getDistanceBetweenTwoPoints(c1.coords, c2.coords);
            let r1 = radiusOfCircleForSplitting;
            let r2 = c2.radius;
            const intersectionInfo = getTwoCirclesIntersectionInfo(r1, r2, distance);
            if (intersectionInfo.intersects) {
                // console.log("no split");
                splitAllowed = false;
            }
        }

        // for (let j of splitMarkers) {
        //     if (j.inGroup || i.id === j.id) {
        //         continue;
        //     }
        //     const distance = getDistanceBetweenTwoPoints(i.coords, j.coords);
        //     let r1 = radiusOfCircleForSplitting;
        //     let r2 = j.radius;
        //     const intersectionInfo = getTwoCirclesIntersectionInfo(r1, r2, distance);
        //     if (intersectionInfo.intersects) {
        //         // console.log("no split");
        //         splitAllowed = false;
        //     }
        // }

        if (c1.people.length > 1 && splitAllowed) {
            
            let splitBubbles = [];
            for (let person of c1.people) {

                let coordRejected = true;
                let rand = null;
                let tries = 0;
                // coordinate of split bubble cannot result in overlap with another bubble
                while (coordRejected && tries != 1000) {
                    // coord is within a circle that has radius of original merged marker's radius * 2
                    rand = getRandCoordsWithinCircle(c1.coords, radiusOfCircleForSplitting, false, seededRNG);
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
                }
                if (tries == 1000 && coordRejected) {
                    console.log(`acceptable position for marker #${splitBubbles.length + 1} could not be found within 1000 attempts for group: `, i)
                    splitAllowed = false;
                    break
                } else {
                    splitBubbles.push({
                        id: person.id,
                        name: person.name,
                        universityAffiliation: person.universityAffiliation,
                        communityAffiliation: person.communityAffiliation,
                        organization: person.organization,
                        links: person.links,
                        radius: radiusOfMarkerRepresentingOnePerson,
                        coords: {
                            x: rand.x,
                            y: rand.y
                        }
                    });
                }
                
            }

            if (splitAllowed) {
                if (c1.splitBubbles === undefined) {
                    c1.splitBubbles = [];
                } 
                c1.splitBubbles = c1.splitBubbles.concat(splitBubbles);
                c1.radius = (c1.radius * 2) + c1.people.length,
                c1.split = true;
                c1.static = true;
            } else {
                c1.split = false;
            }
            // splitMarkers.push(c1);

        } else {
            c1.split = false;
            // splitMarkers.push(c1);
        }
    }
    return markers;
}