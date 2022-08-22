/** 
* Given p1 and p2, points in 2D space, returns the slope of the line created by
* joining p1 and p2.
* @param {{x: Number, y: Number}} p1 point in 2d space.
* @param {{x: Number, y: Number}} p2 point in 2d space.
* @return {Number} slope.
*/
export function getSlopeGivenTwoPoints(p1, p2) {
    return (p1.y - p2.y) / (p1.x - p2.x);
}