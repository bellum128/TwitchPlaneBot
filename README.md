# Twitch Plane Bot
---

### Description
A Twitch chatbot that retreives info about a nearest airplane, using a streamers location returned from a compatible relay service.

### Dependencies
##### Compatible Flight Data APIs
bellum128/FlightProximityAPI

##### Compatible Location Relays
bellum128/RTIRLAPIRelay

### Chat Usage
`!plane`: Request the bot to print the nearest plane to the streamer set in the RTIRLAPIRelay config.

### Datasource Credits
- [FlightRadar24](https://www.flightradar24.com)
- [datasets/airport-codes](https://github.com/datasets/airport-codes/)
- [olahol/iso-3166-2.json](https://github.com/olahol/iso-3166-2.json)
