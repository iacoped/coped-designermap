/** 
* Brief description of the function here.
* @summary If the description is long, write your summary here. Otherwise, feel free to remove this.
* @param {ParamDataTypeHere} parameterNameHere - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
* @return {ReturnValueDataTypeHere} Brief description of the returning value here.
*/
export async function fetchJson(url) {
    try {
        const data = await fetch(url);
        const response = await data.json();  
        return response;
    } catch (error) {
        console.log(error);
    }
};