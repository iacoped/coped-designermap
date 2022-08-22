/** 
* Given p1 and p2, points in 2D space, returns the distance between them.
* @param {{x: Number, y: Number}} p1 point in 2D space.
* @param {{x: Number, y: Number}} p2 point in 2D space.
* @return {Number} distance between p1 and p2.
*/
export function getDistanceBetweenTwoPoints(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}