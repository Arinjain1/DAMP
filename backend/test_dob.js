const API_KEY = 'AIzaSyDiYnY4FG1juihWvHEgM-NSz2aEKUsKing';

async function testDob() {
  try {
    // 1. Get coordinates for Dob, Itarsi
    const forwardUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=Dob,Itarsi,Madhya+Pradesh&key=${API_KEY}`;
    const forwardRes = await fetch(forwardUrl);
    const forwardData = await forwardRes.json();
    
    if (forwardData.results && forwardData.results.length > 0) {
      const { lat, lng } = forwardData.results[0].geometry.location;
      console.log(`Dob, Itarsi Coordinates: lat=${lat}, lng=${lng}`);
      
      // 2. Reverse geocode those coordinates
      const reverseUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;
      const reverseRes = await fetch(reverseUrl);
      const reverseData = await reverseRes.json();
      
      console.log('Reverse Geocode results for Dob:');
      for (let i = 0; i < Math.min(reverseData.results.length, 3); i++) {
        console.log(`Result ${i}: ${reverseData.results[i].formatted_address}`);
        console.log(`Components ${i}:`, JSON.stringify(reverseData.results[i].address_components, null, 2));
      }
    } else {
      console.log('Dob, Itarsi forward geocoding failed');
    }
  } catch (err) {
    console.error(err);
  }
}

testDob();
