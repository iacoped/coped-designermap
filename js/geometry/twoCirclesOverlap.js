/** 
* Brief description of the function here.
* @summary If the description is long, write your summary here. Otherwise, feel free to remove this.
* @param {ParamDataTypeHere} parameterNameHere - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
* @return {ReturnValueDataTypeHere} Brief description of the returning value here.
*/
export function twoCirclesOverlap(r1, r2, distance) {
    return distance <= r1 - r2 || distance <= r2 - r1 || distance < r1 + r2 || distance == r1 + r2;
}