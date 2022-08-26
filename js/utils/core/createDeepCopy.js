export function createDeepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}