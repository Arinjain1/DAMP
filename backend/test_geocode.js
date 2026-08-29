
const API_KEY = 'AIzaSyDiYnY4FG1juihWvHEgM-NSz2aEKUsKing';
const lat = 22.6139;
const lng = 77.7538;

async function testGeocode() {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    
    console.log('STATUS:', data.status);
    if (data.results && data.results.length > 0) {
      console.log('Formatted Address of first result:', data.results[0].formatted_address);
      console.log('Address Components of first result:', JSON.stringify(data.results[0].address_components, null, 2));
    } else {
      console.log('No results found:', data);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testGeocode();
