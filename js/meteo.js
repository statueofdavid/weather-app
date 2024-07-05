import fetchDataFromAPI from './api.js';
import getGeolocation from './deviceLocation.js';

const meteoUrl = 'https://api.open-meteo.com/v1/forecast?';

const location = getGeoLocation();

const meteoParameters = {
	latitude: location.latitude,
	longitude: location.longtitude,
	temperature_unit: 'fahrenheit',
	wind_speed_unit: 'mph',
	precipitation_unit: 'inch',
	timezone: 'America/New_York',
	current: 'temperature_2m,is_day,precipitation,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
	hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,pressure_msl,surface_pressure,cloud_cover,visibility',
	daily: 'sunrise,sunset,daylight_duration,uv_index_max,precipitation_probability_max'
};

const meteoUrlParameters = new URLSearchParams(meteoParameters);
const meteoCall = `${meteoUrl}?${meteoUrlParameters}`;

async function meteoWeatherData() {
  console.log('calling openMeteo api');
  
  const meteoData = fetchDataFromAPI(meteoCall);	

  console.log(meteoData);
  let temp = meteoData.current.temperature_2m;
  let tempUnits = meteoData.current_units.temperature_2m;

      let uv = Math.floor(meteoData.daily.uv_index_max[0]);
      let burnRisk = '';

      if(uv < 3) {
        burnRisk = 'low';
      } else if(uv >= 3 && uv < 6) {
        burnRisk = 'moderate';
      } else if(uv >= 6 && uv < 9) {
        burnRisk = 'high';
      } else {
        burnRisk = 'extreme';
      }
      
      document.querySelector('.temperature').innerHTML = 
	`<span>${temp}${tempUnits}, UV Index Max: ${uv} (${burnRisk})</span>`;

      let precipitationPredictionToday = meteoData.daily.precipitation_probability_max[0];
      let precipit = meteoData.current.preciptiation;
      let isLikelyPercipit = false;
      let pressure = meteoData.current.pressure_msl;

      if(precipit > 0) {
        isLikelyPercipit = true;
      }

      let currentHour = new Date().getHours();
      let pressureUnits = meteoData.current_units.pressure_msl;

      let precipitationPredictionHourly = meteoData.hourly.precipitation_probability[currentHour];
      let relativeHumidity = meteoData.hourly.relative_humidity_2m[currentHour];
      let clouds = meteoData.hourly.cloud_cover[currentHour];
      let viz = Math.floor(meteoData.hourly.visibility[currentHour] / 5280);
      
      document.querySelector('.rain').innerHTML = 
        `<span>Currently Raining: ${isLikelyPercipit}, Rain Likely: ${precipitationPredictionHourly}%</span>`;
      
      document.querySelector('.viz').innerHTML = 
	`<span>Visibility: ${viz} miles, Cloud Coverage: ${clouds}%</span>`;
      
      document.querySelector('.pressure').innerHTML = 
	`<span>Pressure: ${pressure} ${pressureUnits}, Humidity: ${relativeHumidity}%</span>`;

      const cardinalDirections = [
        "N", "NNE", "NE",
        "ENE", "E", "ESE",
        "SE", "SSE", "S",
        "SSW", "SW", "WSW",
        "WNW", "NW", "NNW"];
      
      let windDegrees = meteoData.current.wind_direction_10m;
      let windSpeed = meteoData.current.wind_speed_10m;
      let windGusts = meteoData.current.wind_gusts_10m;

      let speedUnits = meteoData.current_units.wind_speed_10m;
      let windDirection = cardinalDirections[Math.floor(windDegrees / 22.5)];

      document.querySelector('.wind').innerHTML = 
        `<span>${windDirection} at ${windSpeed} ${speedUnits} gusting at ${windGusts} ${speedUnits}</span>`;

      let daylight = Math.floor(meteoData.daily.daylight_duration[0] / 60 / 60);
      let sunrise = new Date(meteoData.daily.sunrise[0]).toLocaleString("en-US", {hour: '2-digit', minute: '2-digit'});
      let sunset = new Date(meteoData.daily.sunset[0]).toLocaleString("en-US", {hour: '2-digit', minute: '2-digit'});
        
      document.querySelector('.light').innerHTML =
	`<span>Sunrise: ${sunrise}, Sunset: ${sunset}, Daylight: ${daylight} hours</span>`;
    })
}
      
document.addEventListener('DOMContentLoaded', function() {
  meteoWeatherData();
})
setInterval(meteoWeatherData, updateInterval);
