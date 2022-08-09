/** 
* Brief description of the function here.
* @summary If the description is long, write your summary here. Otherwise, feel free to remove this.
* @param {ParamDataTypeHere} parameterNameHere - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
* @return {ReturnValueDataTypeHere} Brief description of the returning value here.
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
