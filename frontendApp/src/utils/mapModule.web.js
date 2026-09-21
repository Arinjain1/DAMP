// Web platform shim for react-native-maps
// react-native-maps references native internals which do not exist on web.
// On web, components cleanly fall back to Google Static Maps imagery.
export const MapView = null;
export const PROVIDER_GOOGLE = null;
export const hasNativeMap = false;
export default null;
