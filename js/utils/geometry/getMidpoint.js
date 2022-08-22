/** 
* Given p1 and p2, points in 2D space, returns their midpoint.
* @param {{x: Number, y: Number}} p1 point in 2D space.
* @param {{x: Number, y: Number}} p2 point in 2D space.
* @return {{x: Number, y: Number}} midpoint of p1 and p2.
*/
export function getMidpoint(p1, p2) {
    return {
        x: ((p1.x + p2.x) / 2),
        y: ((p1.y + p2.y) / 2)
    }
}