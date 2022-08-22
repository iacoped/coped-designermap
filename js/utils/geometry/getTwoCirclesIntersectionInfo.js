/** 
* Given the radii of two circles and the distance between their
* centers, returns info about the nature of their intersection.
* @param {Number} r1 radius of the first circle.
* @param {Number} r2 radius of the second circle.
* @param {Number} distanceBetweenCenters distance between the centers.
* @return {Object}} Info about the intersection.
*/
export function getTwoCirclesIntersectionInfo(r1, r2, distanceBetweenCenters) {
    let info = {
        c1ContainsC2: distanceBetweenCenters <= r1 - r2,
        c2ContainsC1: distanceBetweenCenters <= r2 - r1,
        touches: distanceBetweenCenters == r1 + r2,
        intersects: distanceBetweenCenters < r1 + r2
    };
    info.overlapsPerfectly = info.c1ContainsC2 && info.c2ContainsC1;
    info.noIntersection = !(info.c1ContainsC2 || info.c2ContainsC1 || info.overlapsPerfectly || info.touches || info.intersects);
    info.intersectsWithoutTouching = info.intersects && !info.touches;
    return info;
}