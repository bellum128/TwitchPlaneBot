const config = require("./config.json");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const tmi = require("tmi.js");
const airportData = require("./data/airport-codes.json");
const regionData = require("./data/iso_3166_2_region.json");

console.log("Twitch Plane Bot Starting...");
console.log(`oauth address: https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${config.twitchAPI.clientId}&redirect_uri=http://localhost&scope=chat:edit+chat:read`);

const client = new tmi.Client({
    options: { debug: config.twitchAPI.debug ?? false },
    identity: {
        username: config.twitchAPI.botUsername,
        password: `oauth:${config.twitchAPI.token}`
    },
    channels: config.chatChannels
});

client.connect().catch(console.error);

client.on("message", (channel, tags, message, self) => {
    if (self) return;
    if (message.toLowerCase().trim().startsWith("!plane")) {
        (async () => {
            const data = await getFlightData();
            if(data && data.flights)
            {
                if (data.flights.length > 0) {
                    let nearestFlight = data.flights[0];
                    console.log("Nearest flight: ", nearestFlight);
    
                    // We will always have distance.
                    function getDistanceText() {
                        return ` It is ${nearestFlight.distanceToCenter.toFixed(1)} miles away!`
                    }
    
                    function getModelText() {
                        if (nearestFlight.model != "") {
                            function isVowel(str) {
                                return (str.startsWith("a") || str.startsWith("e") || str.startsWith("i") || str.startsWith("o") || str.startsWith("o"));
                            }
    
                            return ` is ${isVowel(nearestFlight.model) ? "an" : "a"} ${nearestFlight.model}`;
                        }
                    }
    
                    function getCallsignOrFlightText() {
                        if (nearestFlight.callsign != "") {
                            return ` flight ${nearestFlight.callsign}`
                        }
                        else if (nearestFlight.flight != "") {
                            return ` flight ${nearestFlight.flight}`
                        }
                        else {
                            return "";
                        }
                    }
    
                    function getCountryNameFromISO(isoCountry) {
                        let countrySet = regionData[isoCountry];
    
                        if (!countrySet)
                            return iso;
    
                        return countrySet["name"];
                    }
    
                    function getRegionNameFromISO(isoCountry, isoRegion) {
                        let countrySet = regionData[isoCountry];
                        let region = countrySet.divisions[isoRegion];
    
                        return region;
                    }
    
                    function getOriginText() {
                        if (nearestFlight.origin != "") {
                            let airport = airportData.filter(a => a.iata_code == nearestFlight.origin)[0];
                            console.log("airport", airport);
                            if (!airport)
                                return ` from ${nearestFlight.origin}`
                            else {
                                // Replace US with state, as a primarily American audience is more familiar with this nomenclature.
                                if (airport.iso_country == "US") { 
                                    return ` from ${airport.municipality}, ${getRegionNameFromISO(airport.iso_country, airport.iso_region)}`
                                }
                                else {
                                    return ` from ${airport.municipality}, ${getCountryNameFromISO(airport.iso_country)}`
                                }
                            }
                        }
                        else {
                            return "";
                        }
                    }
    
                    function getDestinationText() {
                        if (nearestFlight.destination != "") {
                            let airport = airportData.filter(a => a.iata_code == nearestFlight.destination)[0];
                            console.log("airport", airport);
                            if (!airport)
                                return ` to ${nearestFlight.destination}`
                            else
                                return ` to ${airport.municipality}, ${getCountryNameFromISO(airport.iso_country)}`
                        }
                        else {
                            return "";
                        }
                    }
    
                    client.say(channel, `The nearest plane${getModelText()},${getCallsignOrFlightText()}${getOriginText()}${getDestinationText()}.${getDistanceText()}`);
                }
                else {
                    client.say(channel, `There are no known planes within ${config.expandRadiusMiles} miles of the streamer.`);
                }
            }
            else {
                client.say(channel, `Could not retreive the streamer's location.`);
            }
        })();
    }
});

async function getFlightData() {
    try {
        const locationResponse = await fetch(`${config.relayAPI.host}:${config.relayAPI.port}${config.relayAPI.endpoint}`);
        const locationData = await locationResponse.json();

        console.log(`Location data: ${JSON.stringify(locationData)}`);
        if (locationData.latitude && locationData.longitude) {
            const params = new URLSearchParams();

            params.append("north_lat", locationData.latitude);
            params.append("west_long", locationData.longitude);
            params.append("south_lat", locationData.latitude);
            params.append("east_long", locationData.longitude);
            params.append("center_lat", locationData.latitude);
            params.append("center_long", locationData.longitude);
            params.append("expand_radius", config.expandRadiusMiles * 0.0144927536231884);

            const flightResponse = await fetch(`${config.flightAPI.host}:${config.flightAPI.port}/getflights?${params}`);
            const flightData = await flightResponse.json();

            console.log(`Found ${flightData.flights.length} flights`);

            return flightData;
        }
        else {
            console.log("Location could not be retreived at this time.");
        }
    }
    catch (e) {
        console.log(`Error: ${e}`);
        return null;
    }
}
