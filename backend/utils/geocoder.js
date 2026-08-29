import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const geocodeAddress = async (address) => {
  if (!address) return { latitude: null, longitude: null };
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
    const response = await axios.get(url);
    if (response.data && response.data.results && response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }
  } catch (e) {
    console.error(`Geocoding error for address "${address}":`, e.message);
  }
  return { latitude: null, longitude: null };
};
