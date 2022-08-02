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
                const distance = Math.sqrt(Math.pow(i.coords.x - j.coords.x, 2) + Math.pow(i.coords.y - j.coords.y, 2));
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
    console.log(mergedMarkers);
    return mergedMarkers;
}