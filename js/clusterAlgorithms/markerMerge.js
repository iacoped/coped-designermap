import { getDistanceBetweenTwoPoints } from "../utils/geometry/getDistanceBetweenTwoPoints.js";
import { getTwoCirclesIntersectionInfo } from "../utils/geometry/getTwoCirclesIntersectionInfo.js";
import { getMidpoint } from "../utils/geometry/getMidpoint.js";
import { getPointOnLineWithDistanceDirection } from "../utils/geometry/getPointOnLineWithDistanceDirection.js";
// Given an array of markers in the form of circles in 2d space:
// While intersections still exist:
//   1. for each marker m1 that is not in a group:
//      1. for each marker m2 that are not in a group AND m1 != m2:
//         1. if m1 and m2 intersect in a certain way (see code) they should be merged:
//            1. Determine which is the winner and loser (see code)
//            2. The loser is merged into the winner.
//            3. The winner adjusts its radius and location in a certain way (see code)
//            4. Mark the loser as inGroup (it should not be considered in future iterations)
export function markerMergeV8(markers) {
    const markerKeys = Object.keys(markers);
    let intersectionsStillExist = true; 
    while (intersectionsStillExist) {
        intersectionsStillExist = false;
        for (let i of markerKeys) {
            const m1 = markers[i];
            if (m1.inGroup || m1.static) {
                continue;
            }
            for (let j of markerKeys) {
                const m2 = markers[j];
                
                // if they are the same or already in a group, don't compare it
                if (m1.id === m2.id || m2.inGroup || m2.static) {
                    continue;
                }
                // somehow stuff is making it here when inGroup is true, figure out why later
                if (m1.inGroup || m2.inGroup) {
                    continue;
                }
                // logic for computing intersection
                const distance = getDistanceBetweenTwoPoints(m1.coords, m2.coords);
                const r1 = m1.radius;
                const r2 = m2.radius;
                const intersectionInfo = getTwoCirclesIntersectionInfo(r1, r2, distance);
                if (intersectionInfo.intersectsWithoutTouching) {
                    intersectionsStillExist = true;
                    // decide rules for the new marker groups size and position
                    let winner;
                    let loser;
                    if (r1 >= r2) {
                        winner = m1;
                        loser = m2;
                    } else {
                        winner = m2;
                        loser = m1;
                    }

                    winner.members = winner.members.concat(loser.members);
                    winner.people = winner.people.concat(loser.people);
                    loser.inGroup = true;

                    if (!(intersectionInfo.c1ContainsC2 || intersectionInfo.c2ContainsC1)) {
                        const midpoint = getMidpoint(winner.coords, loser.coords);
                        const distanceToMidpoint = getDistanceBetweenTwoPoints(winner.coords, midpoint);
                        const distanceToMoveMergedMarker = distanceToMidpoint * (loser.radius / winner.radius);
                        winner.coords = getPointOnLineWithDistanceDirection(winner.coords, loser.coords, distanceToMoveMergedMarker);
                        winner.radius += 1;
                    } 
                }  
            }
        }
    }

    return markers;
}