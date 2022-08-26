export async function fetchJson(url) {
    try {
        const data = await fetch(url);
        const response = await data.json();  
        return response;
    } catch (error) {
        console.log(error);
    }
};