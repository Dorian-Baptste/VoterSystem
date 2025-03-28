const axios = require("axios");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

exports.verifyAddress = async (address, city, state, zip) => {
  const formattedAddress = `${address}, ${city}, ${state}, ${zip}`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    formattedAddress
  )}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;
      return location; // { lat, lng }
    } else {
      throw new Error("Address verification failed");
    }
  } catch (error) {
    throw new Error("Error contacting Google Maps API");
  }
};
