/** 
* Brief description of the function here.
* @summary If the description is long, write your summary here. Otherwise, feel free to remove this.
* @param {ParamDataTypeHere} parameterNameHere - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
* @return {ReturnValueDataTypeHere} Brief description of the returning value here.
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