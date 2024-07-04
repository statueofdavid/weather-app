// Check if geolocation is supported by the browser
if ("geolocation" in navigator) {
  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };
  
  navigator.geolocation.getCurrentPosition(
  
    (position) => {
  
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;



      console.log(`Latitude: ${lat}, longitude: ${lng}`);
    },

    (error) => {
    
      console.error("Error getting user location:", error);
    },
    options
  );
} else {
  
  console.error("Geolocation is not supported by this browser.");
}
