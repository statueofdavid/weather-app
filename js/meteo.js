// globals
let lng = '';
let lat = '';
// weather-specific globals
const meteoUrl = 'https://api.open-meteo.com/v1/forecast';
const deviceLocation = getGeoLocation();
const meteoParameters = {
	latitude: lat,
	longitude: lng,
	temperature_unit: 'fahrenheit',
	wind_speed_unit: 'mph',
	precipitation_unit: 'inch',
	timezone: 'America/New_York',
	current: 'temperature_2m,is_day,precipitation,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
	hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,pressure_msl,surface_pressure,cloud_cover,visibility',
	daily: 'sunrise,sunset,daylight_duration,uv_index_max,precipitation_probability_max'
};
//tides-specific globals
const noaaUrl = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';
const parameters = {
  station: '8638445',
  date: 'today',
  product: 'predictions',
  datum: 'MLLW',
  time_zone: 'lst_ldt',
  interval: 'hilo',
  units: 'english',
  application: 'declared_space',
  format: 'json'
};

// basic wrapper for fetch
function fetchDataFromAPI(baseUrl, urlParams, options = {}) {
  const searchParams = new URLSearchParams(urlParams);
  const url = `${baseUrl}?${searchParams.toString()}`;

  const response = fetch(url, options);

  if (!response.ok) {
    throw new Error(`API request failed with status: ${response.status}`);
  }

  const data = response.json();
  return data;
}

//device location request
function getGeoLocation() {
	// Check if geolocation is supported by the browser
	if ("geolocation" in navigator) {
  		const options = {
    		enableHighAccuracy: true,
    		timeout: 10000,
    		maximumAge: 0
  	};  
		navigator.geolocation.getCurrentPosition((position) => {
			lat = position.coords.latitude;
			lng = position.coords.longitude;
			console.log(`latitude: ${lat}, longitude: ${lng}`);
		}, (error) => {
			console.error("Error getting user location:", error);
		}, options);
	} else {
		console.error("Geolocation is not supported by this browser.");
	}
}

function meteoWeatherData() {
  console.log('calling openMeteo api');
  
  const meteoData = fetchDataFromAPI(meteoUrl, meteoParameters);	

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
}
      
document.addEventListener('DOMContentLoaded', function() {
  meteoWeatherData();
})
/*
 * https://tidesandcurrents.noaa.gov/web_services_info.html
 * https://www.ncdc.noaa.gov/cdo-web/
 * https://api.tidesandcurrents.noaa.gov/api/prod/
 * https://api.tidesandcurrents.noaa.gov/mdapi/prod/
 * https://api.tidesandcurrents.noaa.gov/dpapi/prod/
 * https://www.digitalocean.com/community/tutorials/how-to-use-the-javascript-fetch-api-to-get-data
 * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Basic_concepts
 * chick_station = 8638445
 * nn_station = 8638610
 * TODO find an api for this url: https://waterdata.usgs.gov/monitoring-location/02042770/#parameterCode=62620&period=P7D&showMedian=true
 */ 

const urlParameters = new URLSearchParams(parameters);

function noaaTidePrediction() {
  console.log('calling tides and currents noaa api');

  return fetch(url + '?' + urlParameters)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      let today = new Date(data.predictions[0].t).toLocaleDateString(
	      "en-US", {year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'});

      let content = `<h3>${today}</h3>`;
      
      for(const tide of data.predictions) {
        let tideType = tide.type === 'H' ? 'High' : 'Low';
        let formattedTime = new Date(tide.t).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        
        content += `<p><b>${tideType} Tide:</b> ${formattedTime}</p>`;
      }

      content += '<span>provided by NOAA<span>';
      document.querySelector('.tide').innerHTML = content;
    })
}

document.addEventListener('DOMContentLoaded', function() {
  noaaTidePrediction();
})
