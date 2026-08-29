const API_KEY = 'AIzaSyDiYnY4FG1juihWvHEgM-NSz2aEKUsKing';

async function testDobVillages() {
  try {
    const address = 'Dob, Hoshangabad, Madhya Pradesh';
    const forwardUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
    const forwardRes = await fetch(forwardUrl);
    const forwardData = await forwardRes.json();
    
    if (forwardData.results && forwardData.results.length > 0) {
      const { lat, lng } = forwardData.results[0].geometry.location;
      console.log(`Dob, Hoshangabad: lat=${lat}, lng=${lng}`);
      
      const reverseUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;
      const reverseRes = await fetch(reverseUrl);
      const reverseData = await reverseRes.json();
      
      if (reverseData.results && reverseData.results.length > 0) {
        console.log('Formatted Address of first result:', reverseData.results[0].formatted_address);
        console.log('Address Components:', JSON.stringify(reverseData.results[0].address_components, null, 2));
      }
    } else {
      console.log('Geocoding failed for Dob, Hoshangabad');
    }
  } catch (err) {
    console.error(err);
  }
}

testDobVillages();
