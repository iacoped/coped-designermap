/** 
* Given the co-ordinates of a 2-dimensional point p(x0, y0), find the points at a distance L 
* away from it, such that the line formed by joining these points has a slope of M.
* https://www.geeksforgeeks.org/find-points-at-a-given-distance-on-a-line-of-given-slope/
* @param {{x: Number, y: Number}} point point in 2D space.
* @param {Number} distance distance from p1 that returned points must be.
* @param {Number} slope slope 
* @return {Array<{x: Number, y: Number}>} points that satisfy the criteria.
*/

export function getPointsOnSameSlope(point, distance, slope) {
    // only two possible points that are a certain distance away from a point and on the same line
    let p1 = {
        x: null,
        y: null
    }
    let p2 = {
        x: null,
        y: null
    }
    p1.x = point.x + distance * Math.sqrt(1 / (1 + Math.pow(slope, 2)));
    p1.y = point.y + distance * slope * Math.sqrt(1 / (1 + Math.pow(slope, 2)));
    p2.x = point.x - distance * Math.sqrt(1 / (1 + Math.pow(slope, 2)));
    p2.y = point.y - distance * slope * Math.sqrt(1 / (1 + Math.pow(slope, 2)));
    return [p1, p2];
}
