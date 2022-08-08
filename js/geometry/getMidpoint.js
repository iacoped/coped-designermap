/** 
* Brief description of the function here.
* @summary If the description is long, write your summary here. Otherwise, feel free to remove this.
* @param {ParamDataTypeHere} parameterNameHere - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
* @return {ReturnValueDataTypeHere} Brief description of the returning value here.
*/
export function getMidpoint(p1, p2) {
    return {
        x: ((p1.x + p2.x) / 2),
        y: ((p1.y + p2.y) / 2)
    }
}