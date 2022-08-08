import { getDistanceBetweenTwoPoints } from "./geometry/getDistanceBetweenTwoPoints.js";
import { twoCirclesOverlap } from "./geometry/twoCirclesOverlap.js";
import { getSlopeGivenTwoPoints } from "./geometry/getSlopeGivenTwoPoints.js";
import { getPointsOnSameSlope } from "./geometry/getPointsOnSameSlope.js";
import { getMidpoint } from "./geometry/getMidpoint.js";
// This module contains multiple variations of the marker merge algorithm.
export function markerMergeV1(markers) {
    // While intersections still exist:
    //   1. for each marker m1 that is not in a group:
    //      1. find any markers m2 that are not in a group and m1 != m2, combine them into merged marker (add radius, find midpoint of i and marker)
    //      2. mark intersecting markers as "merged" already (they should not be considered anymore)
    //      3. don't mark i as merged (merged marker might end up intersecting with it in future)
    let intersectionsStillExist = true; 
    while (intersectionsStillExist) {
        intersectionsStillExist = false;
        for (let i of markers) {
            if (i.inGroup) {
                continue;
            }
            for (let j of markers) {
                // if they are the same or already in the same group, don't compare it
                if (i.id === j.id || j.inGroup) {
                    continue;
                }
                // logic for computing intersection
                const distance = getDistanceBetweenTwoPoints(i.coords, j.coords);
                const r1 = i.radius;
                const r2 = j.radius;
                if (twoCirclesOverlap(r1, r2, distance)) {
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
    const mergedMarkers = markers.filter(markerGroup => !markerGroup.inGroup);
    // determine most common region across all people represented by this marker
    mergedMarkers.forEach((marker) => {
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
    return mergedMarkers;
}

export function markerMergeV2(markers) {
    // While intersections still exist:
    //   1. for each marker m1 that is not in a group:
    //      1. find any markers m2 that are not in a group and m1 != m2, combine them into merged marker (add radius, find midpoint of i and marker)
    //      2. mark intersecting markers as "merged" already (they should not be considered anymore)
    //      3. don't mark i as merged (merged marker might end up intersecting with it in future)
    let intersectionsStillExist = true; 
    while (intersectionsStillExist) {
        intersectionsStillExist = false;
        // console.log(arrForCheckingIntersections);
        for (let i of markers) {
            if (i.inGroup) {
                continue;
            }
            for (let j of markers) {
                // if they are the same or already in the same group, don't compare it
                if (i.id === j.id || j.inGroup) {
                    continue;
                }
                // logic for computing intersection
                // if d <= r1 - r2: Circle B is inside A
                // if d <= r2 - r1: Circle A is inside B
                // if d < r1 + r2:  Circle intersect to each other
                // if d == r1 + r2: Circle touch to each other
                // else: Circle not touch to each other
                const distance = distanceBetweenTwoPoints(i.coords, j.coords);
                let r1 = i.radius;
                let r2 = j.radius;
                // maybe don't change coords if c1 is completely in c2, or something like that
                // if i is in j or j is in i, don't increase radius 
                if (distance <= r1 - r2 || distance <= r2 - r1) {
                    intersectionsStillExist = true;
                    // decide rules for the new marker groups size and position
                    if (i.radius > j.radius) {
                        i.members.push(j.id);
                        i.people = i.people.concat(j.people);
                        // j.members = [];
                        j.inGroup = true;
                    } else {
                        j.members.push(i.id);
                        j.people = j.people.concat(i.people);
                        // j.members = [];
                        i.inGroup = true;
                    }
                } else if (distance < r1 + r2) {
                    intersectionsStillExist = true;
                    // decide rules for the new marker groups size and position
                    if (i.radius > j.radius) {
                        i.members.push(j.id);
                        i.people = i.people.concat(j.people);
                        // j.members = [];
                        j.inGroup = true;
                        i.radius += 1;
                    } else {
                        j.members.push(i.id);
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
                } else if (distance == r1 + r2) {

                }
            }
        }
    }
    // all the markers that are marked inGroup are already part of a group
    const mergedMarkers = markers.filter(markerGroup => !markerGroup.inGroup);
    return mergedMarkers;
}

// same as V1 except can merge if the distance between the border of the two circles is less than a threshold
export function markerMergeV3(markers) {
    // While intersections still exist:
    //   1. for each marker m1 that is not in a group:
    //      1. find any markers m2 that are not in a group and m1 != m2, combine them into merged marker (add radius, find midpoint of i and marker)
    //      2. mark intersecting markers as "merged" already (they should not be considered anymore)
    //      3. don't mark i as merged (merged marker might end up intersecting with it in future)
    let intersectionsStillExist = true; 
    while (intersectionsStillExist) {
        intersectionsStillExist = false;
        for (let i of markers) {
            if (i.inGroup) {
                continue;
            }
            for (let j of markers) {
                // if they are the same or already in the same group, don't compare it
                if (i.id === j.id || j.inGroup) {
                    continue;
                }
                // logic for computing intersection
                const distance = getDistanceBetweenTwoPoints(i.coords, j.coords);
                const r1 = i.radius;
                const r2 = j.radius;
                if (twoCirclesOverlap(r1, r2, distance) || distance - r1 - r2 < 10) {
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
    const mergedMarkers = markers.filter(markerGroup => !markerGroup.inGroup);
    // determine most common region across all people represented by this marker
    mergedMarkers.forEach((marker) => {
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
    return mergedMarkers;
}

export function markerMergeV4(markers) {
    // While intersections still exist:
    //   1. for each marker m1 that is not in a group:
    //      1. find any markers m2 that are not in a group and m1 != m2, combine them into merged marker (add radius, find midpoint of i and marker)
    //      2. mark intersecting markers as "merged" already (they should not be considered anymore)
    //      3. don't mark i as merged (merged marker might end up intersecting with it in future)
    let intersectionsStillExist = true; 
    while (intersectionsStillExist) {
        intersectionsStillExist = false;
        for (let i of markers) {
            if (i.inGroup) {
                continue;
            }
            for (let j of markers) {
                // if they are the same or already in the same group, don't compare it
                if (i.id === j.id || j.inGroup) {
                    continue;
                }
                // logic for computing intersection
                const distance = getDistanceBetweenTwoPoints(i.coords, j.coords);
                const r1 = i.radius;
                const r2 = j.radius;
                if (twoCirclesOverlap(r1, r2, distance)) {
                    intersectionsStillExist = true;
                    // decide rules for the new marker groups size and position
                    if (i.radius > j.radius) {
                        i.members.push(j.id);
                        // i.members = i.members.concat(j.members);
                        i.people = i.people.concat(j.people);
                        // j.members = [];
                        j.inGroup = true;
                        // Even if latlng's are different, when converting to pixel coords, they may end up being the same.
                        // some reading on why this happens: https://stackoverflow.com/questions/41352309/leaflet-latlngtocontainerpoint-and-containerpointtolatlng-not-reciprocal
                        
                        // three cases: slope line is either vertical, horizontal, or diagonal.
                        // need to figure out which direction in 2d space the marker has to go. 
                        // if slope is vertical, move the merged marker up or down based on some ratio of r1 to r2?
                        // if slope is horizontal, move the merged marker left or right based on some ratio of r1 to r2?
                        // if diagonal, 
                        // NaN means x of both coords are the same, don't change location of merged marker at all

                        // distance the mergedMarker should move from its original position.
                        /* 
                            what info do I know? distance that marker should move
                            slope

                        */
                        const midpoint = {
                            x: ((i.coords.x + j.coords.x) / 2),
                            y: ((i.coords.y + j.coords.y) / 2)
                        }
                        const distanceToMidpoint = getDistanceBetweenTwoPoints(i.coords, midpoint);
                        const distanceToMoveMergedMarker = distanceToMidpoint * (j.radius / i.radius);
                        if (i.coords.x == j.coords.x && i.coords.y == j.coords.y) { // points are the same
                            i.radius += 1;
                        } else if (i.coords.y == j.coords.y) { // horizontal line as slope
                            
                            // const distanceToMoveMergedMarker = distanceToMidpoint * (j.radius / i.radius);
                            if (i.coords.x < j.coords.x) {
                                i.coords.x += distanceToMoveMergedMarker;
                            } else {
                                i.coords.x -= distanceToMoveMergedMarker;
                            }
                        } else if (i.coords.x == j.coords.x) { // vertical line as slope
                            // const distanceToMoveMergedMarker = distanceToMidpoint * (j.radius / i.radius);

                            if (i.coords.y < j.coords.y) {
                                i.coords.y -= distanceToMoveMergedMarker;
                            } else {
                                i.coords.y += distanceToMoveMergedMarker;
                            }
                        } else { // slope is diagonal, need to do more calculations
                            const slope = getSlopeGivenTwoPoints(i.coords, j.coords);
                            
                            const yIntercept = i.coords.y - (slope * i.coords.x)
                            // https://www.geeksforgeeks.org/find-points-at-a-given-distance-on-a-line-of-given-slope/
                            let newXcoord = i.coords.x + distance * Math.sqrt(1 / (1 + Math.pow(slope, 2)));
                            // let newYcoord = i.coords.x + distance * slope * Math.sqrt(1 / (1 + Math.pow(slope, 2)));
                            if (slope < 0 && i.coords.x > j.coords.x) {
                                i.coords.x = i.coords.x - distanceToMoveMergedMarker * Math.sqrt(1 / (1 + Math.pow(slope, 2)));
                                
                                i.coords.y = slope * i.coords.x + yIntercept;

                            } else if (slope < 0 && i.coords.x < j.coords.x) {
                                i.coords.x = i.coords.x + distanceToMoveMergedMarker * Math.sqrt(1 / (1 + Math.pow(slope, 2)));
                                i.coords.y = slope * i.coords.x + yIntercept;

                            } else if (slope > 0 && i.coords.x < j.coords.x) {
                                i.coords.x = i.coords.x + distanceToMoveMergedMarker * Math.sqrt(1 / (1 + Math.pow(slope, 2)));
                                i.coords.y = slope * i.coords.x + yIntercept;

                            } else if (slope > 0 && i.coords.x > j.coords.x) {
                                i.coords.x = i.coords.x - distanceToMoveMergedMarker * Math.sqrt(1 / (1 + Math.pow(slope, 2)));
                                i.coords.y = slope * i.coords.x + yIntercept;

                            }
                            i.radius += 1;
                        }
                    } else {
                        j.members.push(i.id);
                        // i.members = i.members.concat(j.members);
                        j.people = j.people.concat(i.people);
                        // j.members = [];
                        i.inGroup = true;
                        const midpoint = {
                            x: ((i.coords.x + j.coords.x) / 2),
                            y: ((i.coords.y + j.coords.y) / 2)
                        }
                        const distanceToMidpoint = getDistanceBetweenTwoPoints(i.coords, midpoint);
                        const distanceToMoveMergedMarker = distanceToMidpoint * (i.radius / j.radius);
                        if (i.coords.x == j.coords.x && i.coords.y == j.coords.y) {
                            j.radius += 1;

                        } else if (i.coords.y == j.coords.y) {
                            console.log(i, j)
                            if (i.coords.x < j.coords.x) {
                                j.coords.x -= distanceToMoveMergedMarker;
                            } else {
                                j.coords.x += distanceToMoveMergedMarker;
                            }

                        } else if (i.coords.x == j.coords.x) {
                            if (i.coords.y < j.coords.y) {
                                j.coords.y -= distanceToMoveMergedMarker;
                            } else {
                                j.coords.y += distanceToMoveMergedMarker;
                            }

                        } else {
                            const slope = getSlopeGivenTwoPoints(i.coords, j.coords);
                            const yIntercept = i.coords.y - (slope * i.coords.x)
                            console.log(`y = ${slope}x + ${yIntercept}`);

                            if (slope < 0 && j.coords.x > i.coords.x) {

                                j.coords.x = j.coords.x - distanceToMoveMergedMarker * Math.sqrt(1 / (1 + Math.pow(slope, 2)));
                                j.coords.y = slope * j.coords.x + yIntercept;

                            } else if (slope < 0 && j.coords.x < i.coords.x) {

                                j.coords.x = j.coords.x + distanceToMoveMergedMarker * Math.sqrt(1 / (1 + Math.pow(slope, 2)));
                                j.coords.y = slope * j.coords.x + yIntercept;

                            } else if (slope > 0 && j.coords.x < i.coords.x) {

                                j.coords.x = j.coords.x + distanceToMoveMergedMarker * Math.sqrt(1 / (1 + Math.pow(slope, 2)));
                                j.coords.y = slope * j.coords.x + yIntercept;

                            } else if (slope > 0 && j.coords.x > i.coords.x) {

                                j.coords.x = j.coords.x - distanceToMoveMergedMarker * Math.sqrt(1 / (1 + Math.pow(slope, 2)));
                                j.coords.y = slope * j.coords.x + yIntercept;

                            }
                            j.radius += 1;
                        }
                    }
                }  
            }
        }
    }
    // all the markers that are marked inGroup are already part of a group
    const mergedMarkers = markers.filter(markerGroup => !markerGroup.inGroup);
    // determine most common region across all people represented by this marker
    mergedMarkers.forEach((marker) => {
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
    return mergedMarkers;
}


export function markerMergeV5(markers) {
    // While intersections still exist:
    //   1. for each marker m1 that is not in a group:
    //      1. find any markers m2 that are not in a group and m1 != m2, combine them into merged marker (add radius, find midpoint of i and marker)
    //      2. mark intersecting markers as "merged" already (they should not be considered anymore)
    //      3. don't mark i as merged (merged marker might end up intersecting with it in future)
    let intersectionsStillExist = true; 
    while (intersectionsStillExist) {
        intersectionsStillExist = false;
        for (let i of markers) {
            if (i.inGroup) {
                continue;
            }
            for (let j of markers) {
                // if they are the same or already in the same group, don't compare it
                if (i.id === j.id || j.inGroup) {
                    continue;
                }
                // logic for computing intersection
                const distance = getDistanceBetweenTwoPoints(i.coords, j.coords);
                const r1 = i.radius;
                const r2 = j.radius;
                if (twoCirclesOverlap(r1, r2, distance)) {
                    intersectionsStillExist = true;
                    // decide rules for the new marker groups size and position
                    if (i.radius > j.radius) {
                        i.members.push(j.id);
                        // i.members = i.members.concat(j.members);
                        i.people = i.people.concat(j.people);
                        // j.members = [];
                        j.inGroup = true;
                        // Even if latlng's are different, when converting to pixel coords, they may end up being the same.
                        // some reading on why this happens: https://stackoverflow.com/questions/41352309/leaflet-latlngtocontainerpoint-and-containerpointtolatlng-not-reciprocal
                        
                        // three cases: slope line is either vertical, horizontal, or diagonal.
                        // need to figure out which direction in 2d space the marker has to go. 
                        // if slope is vertical, move the merged marker up or down based on some ratio of r1 to r2?
                        // if slope is horizontal, move the merged marker left or right based on some ratio of r1 to r2?
                        // if diagonal, 
                        // NaN means x of both coords are the same, don't change location of merged marker at all

                        // distance the mergedMarker should move from its original position.
                        /* 
                            what info do I know? distance that marker should move
                            slope

                        */
                        const midpoint = getMidpoint(i.coords, j.coords);
                        const distanceToMidpoint = getDistanceBetweenTwoPoints(i.coords, midpoint);
                        const distanceToMoveMergedMarker = distanceToMidpoint * (j.radius / i.radius);
                        if (i.coords.x == j.coords.x && i.coords.y == j.coords.y) { // points are the same
                            i.radius += 1;
                        } else if (i.coords.y == j.coords.y) { // horizontal line as slope
                            if (i.coords.x < j.coords.x) {
                                i.coords.x += distanceToMoveMergedMarker;
                            } else {
                                i.coords.x -= distanceToMoveMergedMarker;
                            }
                        } else if (i.coords.x == j.coords.x) { // vertical line as slope
                            if (i.coords.y < j.coords.y) {
                                i.coords.y -= distanceToMoveMergedMarker;
                            } else {
                                i.coords.y += distanceToMoveMergedMarker;
                            }
                        } else { // slope is diagonal, need to do more calculations
                            const slope = getSlopeGivenTwoPoints(i.coords, j.coords);
                            const pointsOnSameSlope = getPointsOnSameSlope(i.coords, distanceToMoveMergedMarker, slope);
                            // https://www.geeksforgeeks.org/find-points-at-a-given-distance-on-a-line-of-given-slope/
                            if (slope < 0 && i.coords.x > j.coords.x) {
                                i.coords = pointsOnSameSlope[1];                             
                            } else if (slope < 0 && i.coords.x < j.coords.x) {
                                i.coords = pointsOnSameSlope[0];
                            } else if (slope > 0 && i.coords.x < j.coords.x) {
                                i.coords = pointsOnSameSlope[0];
                            } else if (slope > 0 && i.coords.x > j.coords.x) {
                                i.coords = pointsOnSameSlope[1];  
                            }
                            i.radius += 1;
                        }
                    } else {
                        j.members.push(i.id);
                        // i.members = i.members.concat(j.members);
                        j.people = j.people.concat(i.people);
                        // j.members = [];
                        i.inGroup = true;
                        const midpoint = getMidpoint(i.coords, j.coords);
                        const distanceToMidpoint = getDistanceBetweenTwoPoints(j.coords, midpoint);
                        const distanceToMoveMergedMarker = distanceToMidpoint * (i.radius / j.radius);

                        if (i.coords.x == j.coords.x && i.coords.y == j.coords.y) {
                            j.radius += 1;
                        } else if (i.coords.y == j.coords.y) {
                            if (i.coords.x < j.coords.x) {
                                j.coords.x -= distanceToMoveMergedMarker;
                            } else {
                                j.coords.x += distanceToMoveMergedMarker;
                            }

                        } else if (i.coords.x == j.coords.x) {
                            if (i.coords.y < j.coords.y) {
                                j.coords.y -= distanceToMoveMergedMarker;
                            } else {
                                j.coords.y += distanceToMoveMergedMarker;
                            }
                        } else {
                            const slope = getSlopeGivenTwoPoints(i.coords, j.coords);
                            const pointsOnSameSlope = getPointsOnSameSlope(j.coords, distanceToMoveMergedMarker, slope);
                            if (slope < 0 && j.coords.x > i.coords.x) {
                                j.coords = pointsOnSameSlope[1];   
                            } else if (slope < 0 && j.coords.x < i.coords.x) {
                                j.coords = pointsOnSameSlope[0];
                            } else if (slope > 0 && j.coords.x < i.coords.x) {
                                j.coords = pointsOnSameSlope[0];
                            } else if (slope > 0 && j.coords.x > i.coords.x) {
                                j.coords = pointsOnSameSlope[1];
                            }
                            j.radius += 1;
                        }
                    }
                }  
            }
        }
    }
    // all the markers that are marked inGroup are already part of a group
    const mergedMarkers = markers.filter(markerGroup => !markerGroup.inGroup);
    // determine most common region across all people represented by this marker
    mergedMarkers.forEach((marker) => {
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
    return mergedMarkers;
}

export function markerMergeV6(markers) {
    // While intersections still exist:
    //   1. for each marker m1 that is not in a group:
    //      1. find any markers m2 that are not in a group and m1 != m2, combine them into merged marker (add radius, find midpoint of i and marker)
    //      2. mark intersecting markers as "merged" already (they should not be considered anymore)
    //      3. don't mark i as merged (merged marker might end up intersecting with it in future)
    let intersectionsStillExist = true; 
    while (intersectionsStillExist) {
        intersectionsStillExist = false;
        for (let i of markers) {
            if (i.inGroup) {
                continue;
            }
            for (let j of markers) {
                // if they are the same or already in the same group, don't compare it
                if (i.id === j.id || j.inGroup) {
                    continue;
                }
                // logic for computing intersection
                const distance = getDistanceBetweenTwoPoints(i.coords, j.coords);
                const r1 = i.radius;
                const r2 = j.radius;
                if (twoCirclesOverlap(r1, r2, distance)) {
                    intersectionsStillExist = true;
                    // decide rules for the new marker groups size and position
                    let winner, loser;
                    if (i.radius >= j.radius) {
                        winner = i;
                        loser = j;
                    } else {
                        winner = j;
                        loser = i;
                    }
                    winner.members.push(loser.id);
                    // winner.members = winner.members.concat(loser.members);
                    winner.people = winner.people.concat(loser.people);
                    // loser.members = [];
                    loser.inGroup = true;
                    const midpoint = getMidpoint(winner.coords, loser.coords);
                    const distanceToMidpoint = getDistanceBetweenTwoPoints(winner.coords, midpoint);
                    const distanceToMoveMergedMarker = distanceToMidpoint * (loser.radius / winner.radius);

                    if (winner.coords.x == loser.coords.x && winner.coords.y == loser.coords.y) {
                        winner.radius += 1;
                    } else if (winner.coords.y == loser.coords.y) {
                        if (winner.coords.x > loser.coords.x) {
                            winner.coords.x -= distanceToMoveMergedMarker;
                        } else {
                            winner.coords.x += distanceToMoveMergedMarker;
                        }

                    } else if (winner.coords.x == loser.coords.x) {
                        if (winner.coords.y > loser.coords.y) {
                            winner.coords.y -= distanceToMoveMergedMarker;
                        } else {
                            winner.coords.y += distanceToMoveMergedMarker;
                        }
                    } else {
                        const slope = getSlopeGivenTwoPoints(winner.coords, loser.coords);
                        const pointsOnSameSlope = getPointsOnSameSlope(winner.coords, distanceToMoveMergedMarker, slope);
                        if (slope < 0 && winner.coords.x > loser.coords.x) {
                            winner.coords = pointsOnSameSlope[1];   
                        } else if (slope < 0 && winner.coords.x < loser.coords.x) {
                            winner.coords = pointsOnSameSlope[0];
                        } else if (slope > 0 && winner.coords.x < loser.coords.x) {
                            winner.coords = pointsOnSameSlope[0];
                        } else if (slope > 0 && winner.coords.x > loser.coords.x) {
                            winner.coords = pointsOnSameSlope[1];
                        }
                        winner.radius += 1;
                    }
                }  
            }
        }
    }
    // all the markers that are marked inGroup are already part of a group
    const mergedMarkers = markers.filter(markerGroup => !markerGroup.inGroup);
    // determine most common region across all people represented by this marker
    mergedMarkers.forEach((marker) => {
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
    return mergedMarkers;
}