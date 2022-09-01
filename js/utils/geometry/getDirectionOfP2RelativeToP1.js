/** 
* Given p1 and p2, points in 2D space, returns the direction of p2 relative to 
* p1 in human-readable language.
* @param {{x: Number, y: Number}} p1 point in 2D space.
* @param {{x: Number, y: Number}} p2 point in 2D space.
* @return {String} direction of p2 relative to p1 in human-readable language.
*/
export function getDirectionOfP2RelativeToP1(p1, p2) {
    if (p1.x == p2.x && p1.y == p2.y) { // they have the same coordinates
        return "none";
    } else if (p1.y == p2.y) { 
        if (p1.x > p2.x) {
            return "to its left";
        } else {
            return "to its right";
        }
    } else if (p1.x == p2.x) {
        if (p1.y > p2.y) {
            return "above it";
        } else {
            return "below it";
        }
    } else {
        if (p1.x > p2.x && p1.y < p2.y) {
            return "its upper left";
        } else if (p1.x < p2.x && p1.y > p2.y) {
            return "its bottom right";
        } else if (p1.x < p2.x && p1.y < p2.y) {
            return "its upper right";
        } else if (p1.x > p2.x && p1.y > p2.y) {
            return "its bottom left";
        }
    }
}