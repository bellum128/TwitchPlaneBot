const config = require("./config.json");
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));

console.log("Twitch Plane Bot Starting...");

fetch(`${config.relayAPI.host}:${config.relayAPI.port}/location`).then(data => {
    return data.json();
}).then((data) => {
    console.log(`Location data: ${JSON.stringify(data)}`);

    const params = new URLSearchParams();
    if(data.latitude && data.longitude)
    {
        console.log("Calling Flight Display API service.");
        params.append("north_lat", data.latitude);
        params.append("west_long", data.longitude);
        params.append("south_lat", data.latitude);
        params.append("east_long", data.longitude);
        params.append("center_lat", data.latitude);
        params.append("center_long", data.longitude);
        params.append("expand_radius", config.expandRadiusMiles * 0.0144927536231884);

        fetch(`${config.flightAPI.host}:${config.flightAPI.port}/getflights?${params}`).then(data => {
            return data.json();
        }).then((data) => {
            console.log(data);
        });
    }
});
