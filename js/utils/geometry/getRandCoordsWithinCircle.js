/** 
* https://jsfiddle.net/b0sb5ogL/1/
* Given a circle with location of its center and radius, generates a random point within the circle. 
* @param {{x: Number, y: Number}} circleCoords coordinates of center of the circle.
* @param {Number} circleRadius radius of the circle.
* @param {boolean} uniform Whether to use a uniform distribution or not.
* @param {function} seededRNG seeded RNG provided by seedrandom external package.
* @return {{x: Number, y: Number}} random point within the circle.
*/
export function getRandCoordsWithinCircle(circleCoords, circleRadius, uniform, seededRNG) {
                    
    let a = seededRNG(),
        b = seededRNG();
    
    if (uniform) {
        if (b < a) {
            let c = b;
            b = a;
            a = c;
        }
    }
    
    return {
        x: circleCoords.x + (b * circleRadius * Math.cos(2 * Math.PI * a / b)),
        y: circleCoords.y + (b * circleRadius * Math.sin(2 * Math.PI * a / b))
    }
}