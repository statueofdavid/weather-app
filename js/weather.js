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

// globals
let lng = '';
let lat = '';
let refreshButton = '';
// this makes me rethink using pure javascript... what is pure js anyway... ugh
document.addEventListener("DOMContentLoaded", function() {
  refreshButton = document.getElementById("refresh");
  console.log(refreshButton);
  
  refreshButton.addEventListener("click", function() {
    console.log("refreshing...");
    getGeoLocation();
  });

  refreshButton.addEventListener("mouseup", function() {
    refreshButton.classList.remove(":active"); // Remove active state on mouseup
  }); 
});


// weather-specific globals
const deviceLocation = getGeoLocation();
const meteoUrl = 'https://api.open-meteo.com/v1/forecast';
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
const noaaParameters = {
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
function fetchDataFromAPI(baseUrl, urlParams) {
  const searchParams = new URLSearchParams(urlParams);

  console.log(`${baseUrl}, ${urlParams}, ${searchParams}`)

  const url = `${baseUrl}?${searchParams}`;

  return fetch(url)
    .then(response => {
      console.log(`${url}, ${response}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      return response.json();
    })
   .catch(error => {
            console.error("Error fetching data:", error);
            return undefined;
    }); 
}

//device location request
async function getGeoLocation() {
  refreshButton.disabled = true;
  refreshButton.textContent = "Retrieving Location...";
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

      noaaTidePrediction();
      meteoWeatherData(lat, lng);
      refreshButton.disabled = false;
      refreshButton.textContent = "Refresh Using Your Device Location";

		}, (error) => {
			console.error("Error getting user location:", error);
      
      setTimeout(function() {
        refreshButton.textContent = "There was an error, try again soon";
      }, 2000);
      
      refreshButton.disabled = false;
      refreshButton.textContent = "Refresh Using Your Device Location";
		}, options);
	} else {
		console.error("Geolocation is not supported by this browser.");
	}
}

async function meteoWeatherData(latitude, longitude) {
  console.log('calling openMeteo api');
  
  meteoParameters.latitude = latitude;
  meteoParameters.longitude = longitude;

  try {
    const meteoData = await fetchDataFromAPI(meteoUrl, meteoParameters)
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
  } catch(error) {
    console.error("Something happened with the meteo call", error);
  };
}

async function noaaTidePrediction() {
  console.log('calling tides and currents noaa api');

  try {
    const noaaData = await fetchDataFromAPI(noaaUrl, noaaParameters);

    console.log(noaaData);
    let today = new Date(noaaData.predictions[0].t).toLocaleDateString(
	    "en-US", {year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'});

    let content = `<h3>${today}</h3>`;
      
    for(const tide of noaaData.predictions) {
      let tideType = tide.type === 'H' ? 'High' : 'Low';
      let formattedTime = new Date(tide.t).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        
      content += `<p><b>${tideType} Tide:</b> ${formattedTime}</p>`;
    }

    content += '<span>provided by NOAA<span>';
    document.querySelector('.tide').innerHTML = content;
  
  } catch(error) {
    console.error("Something happened with the noaa call", error);
  }
}


