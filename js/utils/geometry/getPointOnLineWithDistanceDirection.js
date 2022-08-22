import { getSlopeGivenTwoPoints } from "./getSlopeGivenTwoPoints.js";
import { getPointsOnSameSlope } from "./getPointsOnSameSlopeAndCertainDistanceAway.js";
import { getDirectionOfP2RelativeToP1 } from "./getDirectionOfP2RelativeToP1.js";
/** 
* Given two points p1 and p2 and a distance D, returns a point p3 that satisfies 
* certain criteria: 
* 1. It is on the line formed by joining p1 and p2.
* 2. It is distance D away from p1.
* 3. Its direction relative to p1 is equal to p2's direction relative to p1.
* @param {{x: Number, y: Number}} p1 point in 2D space.
* @param {{x: Number, y: Number}} p2 point in 2D space.
* @param {Number} distanceFromP1 distance from p1 that p3 must be.
* @return {{x: Number, y: Number}} point that satisfies the criteria.
*/
export function getPointOnLineWithDistanceDirection(p1, p2, distanceFromP1) {
    const directionOfP2RelativetoP1 = getDirectionOfP2RelativeToP1(p1, p2);
    let slope;
    let points;
    let p3;
    switch (directionOfP2RelativetoP1) {
        case ("none"): // marker is right on top of refPoint (very unlikely)
            p3 = createDeepCopy(p1);
            break;
        case ("to its left"):
            p3 = {
                x: p1.x - distanceFromP1,
                y: p1.y
            }
            break;
        case ("to its right"):
            p3 = {
                x: p1.x + distanceFromP1,
                y: p1.y
            }
            break;
        case ("above it"):
            p3 = {
                x: p1.x,
                y: p1.y + distanceFromP1
            }
            break;
        case ("below it"):
            p3 = {
                x: p1.x,
                y: p1.y - distanceFromP1
            }
            break;
        case ("its upper left"):
            // console.log(refPointInPxCoords, referenceInfo[j].originalMarkerCoordsInPx);
            slope = getSlopeGivenTwoPoints(p1, p2);
            points = getPointsOnSameSlope(p1, distanceFromP1, slope);
            p3 = points[1];
            break;
        case ("its bottom right"):
            // console.log(refPointInPxCoords, referenceInfo[j].originalMarkerCoordsInPx);
            slope = getSlopeGivenTwoPoints(p1, p2);
            points = getPointsOnSameSlope(p1, distanceFromP1, slope);
            p3 = points[0];
            break;
        case ("its upper right"):
            // console.log(refPointInPxCoords, referenceInfo[j].originalMarkerCoordsInPx);
            slope = getSlopeGivenTwoPoints(p1, p2);
            points = getPointsOnSameSlope(p1, distanceFromP1, slope);
            p3 = points[0];
            break;
        case ("its bottom left"):
            // console.log(refPointInPxCoords, referenceInfo[j].originalMarkerCoordsInPx);
            slope = getSlopeGivenTwoPoints(p1, p2);
            points = getPointsOnSameSlope(p1, distanceFromP1, slope);
            p3 = points[1];
            break;
    }
    
    return p3;
}