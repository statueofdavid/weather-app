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
const url = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';
const updateInterval = 60 * 60 * 1000;

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
setInterval(noaaTidePrediction, updateInterval);
