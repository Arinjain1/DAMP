let MapView = null;
let PROVIDER_GOOGLE = null;
let hasNativeMap = false;

try {
  const Maps = require('react-native-maps');
  MapView = Maps.default || Maps.MapView || Maps;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  hasNativeMap = !!MapView;
} catch (_e) {
  console.log('react-native-maps native binary module not registered. Falling back to static maps.');
  hasNativeMap = false;
}

export { MapView, PROVIDER_GOOGLE, hasNativeMap };
export default MapView;
