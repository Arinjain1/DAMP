import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Alert
} from 'react-native';
import * as Location from 'expo-location';
import * as LucideIcons from 'lucide-react-native';
import { showToast } from '../utils/toast';

let MapView = null;
let PROVIDER_GOOGLE = null;
let hasNativeMap = false;

try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  hasNativeMap = !!MapView;
} catch (e) {
  console.log('react-native-maps native binary module not registered. Falling back to static maps.');
  hasNativeMap = false;
}

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDiYnY4FG1juihWvHEgM-NSz2aEKUsKing';

export default function MapPickerModal({ visible, onClose, onSelectLocation }) {
  const [coordinates, setCoordinates] = useState({ latitude: 19.0760, longitude: 72.8777 }); // Default to Mumbai
  const [address, setAddress] = useState('Mumbai, Maharashtra, India');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const debounceTimer = useRef(null);
  const mapRef = useRef(null);
  const isUserDragging = useRef(false);

  // 1. Fetch current location on mount/open
  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast.warn('Please grant location permissions to use current location.');
        setLoading(false);
        return;
      }
      
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      let loc = null;

      if (!servicesEnabled) {
        showToast.warn('Location services (GPS) are turned off. Please enable GPS.');
        loc = await Location.getLastKnownPositionAsync();
      } else {
        try {
          const locationPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Location timeout')), 6000)
          );
          loc = await Promise.race([locationPromise, timeoutPromise]);
        } catch (err) {
          console.log('GPS getCurrentPositionAsync timed out or failed, trying last known position:', err.message);
          loc = await Location.getLastKnownPositionAsync();
        }
      }

      if (!loc) {
        throw new Error('Could not retrieve location');
      }

      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;
      setCoordinates({ latitude: lat, longitude: lng });
      
      if (hasNativeMap && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      }
      
      await reverseGeocode(lat, lng);
    } catch (e) {
      console.log('GPS load failed/timed out, using fallback coordinates:', e.message);
      const fallbackRegion = { latitude: 19.0760, longitude: 72.8777 };
      setCoordinates(fallbackRegion);
      
      if (hasNativeMap && mapRef.current) {
        mapRef.current.animateToRegion({
          ...fallbackRegion,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      }
      
      await reverseGeocode(19.0760, 72.8777);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    }
  }, [visible]);

  // 2. Reverse Geocode (Lat/Lng -> Address)
  const reverseGeocode = async (lat, lng) => {
    setMapLoading(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setAddress(data.results[0].formatted_address);
      } else {
        // Fallback to Native reverse geocoding
        const nativeAddr = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (nativeAddr.length > 0) {
          const addr = nativeAddr[0];
          const city = addr.city || addr.subregion || addr.district || '';
          const street = addr.street || addr.name || '';
          const region = addr.region || addr.country || '';
          setAddress([street, city, region].filter(Boolean).join(', '));
        }
      }
    } catch (err) {
      console.log('Reverse geocoding error:', err);
    } finally {
      setMapLoading(false);
    }
  };

  // 3. Search Autocomplete suggestions
  const fetchSuggestions = (query) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            query
          )}&key=${API_KEY}&components=country:in`
        );
        const data = await res.json();
        if (data.predictions) {
          setSuggestions(data.predictions);
        }
      } catch (err) {
        console.log('Place suggestion error:', err);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    fetchSuggestions(text);
  };

  // 4. Select Suggestion (Place ID -> Lat/Lng & Address)
  const selectSuggestion = async (item) => {
    setSuggestions([]);
    setSearchQuery('');
    setLoading(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?place_id=${item.place_id}&key=${API_KEY}`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setCoordinates({ latitude: lat, longitude: lng });
        
        if (hasNativeMap && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }, 1000);
        }
        
        setAddress(data.results[0].formatted_address);
      }
    } catch (e) {
      showToast.error('Could not get coordinates for selected place.');
    } finally {
      setLoading(false);
    }
  };

  const handleMapRegionChange = (region) => {
    setCoordinates({ latitude: region.latitude, longitude: region.longitude });
  };

  const handleRegionChangeComplete = async (region) => {
    if (isUserDragging.current) {
      setCoordinates({ latitude: region.latitude, longitude: region.longitude });
      await reverseGeocode(region.latitude, region.longitude);
    }
  };

  const touchStartPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const handleTouchStart = (e) => {
    const { pageX, pageY } = e.nativeEvent;
    touchStartPos.current = { x: pageX, y: pageY };
    isDragging.current = true;
  };

  const handleTouchEnd = async (e) => {
    if (!isDragging.current) return;
    const { pageX, pageY } = e.nativeEvent;
    const dx = pageX - touchStartPos.current.x;
    const dy = pageY - touchStartPos.current.y;
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      const latChange = (dy / 240) * 0.003;
      const lngChange = (dx / 350) * 0.003;
      
      const newLat = coordinates.latitude + latChange;
      const newLng = coordinates.longitude - lngChange;

      setCoordinates({ latitude: newLat, longitude: newLng });
      await reverseGeocode(newLat, newLng);
    }
    isDragging.current = false;
  };

  // 5. Fine-tuning pan controls
  const handlePan = async (direction) => {
    const step = 0.0006; // Roughly ~60 meters
    let newLat = coordinates.latitude;
    let newLng = coordinates.longitude;

    if (direction === 'up') newLat += step;
    else if (direction === 'down') newLat -= step;
    else if (direction === 'left') newLng -= step;
    else if (direction === 'right') newLng += lngStepCalculated(step, coordinates.latitude);

    setCoordinates({ latitude: newLat, longitude: newLng });
    await reverseGeocode(newLat, newLng);
  };

  // Adjust longitude step size based on latitude position (closer to poles, lines of longitude merge)
  const lngStepCalculated = (step, lat) => {
    const rad = (lat * Math.PI) / 180;
    return step / Math.max(0.1, Math.cos(rad));
  };

  const handleConfirm = () => {
    if (onSelectLocation) {
      onSelectLocation(address);
    }
    onClose();
  };

  // Construct static maps URL (marker query parameter removed since we use absolute centered overlay pin)
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.latitude},${coordinates.longitude}&zoom=16&size=600x350&scale=2&key=${API_KEY}`;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <LucideIcons.ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
          <TouchableOpacity onPress={getCurrentLocation} style={styles.locateBtn}>
            <LucideIcons.Locate size={20} color="#7c3aed" />
          </TouchableOpacity>
        </View>

        {/* Search Box */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <LucideIcons.Search size={18} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Search area, landmark or society..."
              placeholderTextColor="#9ca3af"
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearchChange('')}>
                <LucideIcons.X size={18} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Autocomplete Suggestions */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsBox}>
              <ScrollView keyboardShouldPersistTaps="handled">
                {suggestions.map((item) => (
                  <TouchableOpacity
                    key={item.place_id}
                    onPress={() => selectSuggestion(item)}
                    style={styles.suggestionItem}
                  >
                    <LucideIcons.MapPin size={16} color="#6b7280" style={{ marginRight: 10, marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.suggestionMainText}>{item.structured_formatting?.main_text || item.description}</Text>
                      {item.structured_formatting?.secondary_text ? (
                        <Text style={styles.suggestionSubText}>{item.structured_formatting.secondary_text}</Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Map Display & Controls */}
        <View style={styles.mapWrapper}>
          {loading ? (
            <View style={styles.mapPlaceholder}>
              <ActivityIndicator size="large" color="#7c3aed" />
              <Text style={styles.loadingText}>Fetching location details...</Text>
            </View>
          ) : hasNativeMap && MapView ? (
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                initialRegion={{
                  latitude: coordinates.latitude,
                  longitude: coordinates.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                onRegionChange={handleMapRegionChange}
                onRegionChangeComplete={handleRegionChangeComplete}
                onTouchStart={() => {
                  isUserDragging.current = true;
                }}
                loadingEnabled
                pitchEnabled={false}
                rotateEnabled={false}
                style={styles.map}
                showsUserLocation
                showsMyLocationButton={false}
              />
              
              {/* Center locked Pin overlay */}
              <View pointerEvents="none" style={styles.markerFixedOverlay}>
                <View style={styles.markerContainer}>
                  {mapLoading ? (
                    <ActivityIndicator color="#7c3aed" size="small" />
                  ) : (
                    <LucideIcons.MapPin size={28} color="#7c3aed" />
                  )}
                </View>
              </View>
            </View>
          ) : (
            <View 
              style={styles.mapContainer}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <Image source={{ uri: staticMapUrl }} style={styles.mapImage} />
              
              {/* Center locked Pin overlay for fallback */}
              <View pointerEvents="none" style={styles.markerFixedOverlay}>
                <View style={styles.markerContainer}>
                  {mapLoading ? (
                    <ActivityIndicator color="#7c3aed" size="small" />
                  ) : (
                    <LucideIcons.MapPin size={28} color="#7c3aed" />
                  )}
                </View>
              </View>
              
              {mapLoading && (
                <View style={styles.mapLoadingOverlay}>
                  <ActivityIndicator size="small" color="#7c3aed" />
                </View>
              )}
            </View>
          )}
        </View>

        {/* Selected Address Confirm Box */}
        <View style={styles.confirmBox}>
          <View style={styles.addressDisplayRow}>
            <View style={styles.addressIconWrap}>
              <LucideIcons.MapPin size={22} color="#7c3aed" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.confirmHeading}>Selected Location</Text>
              <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn} disabled={loading}>
            <Text style={styles.confirmBtnText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Montserrat_700Bold',
  },
  locateBtn: {
    padding: 8,
    backgroundColor: '#f5f3ff',
    borderRadius: 10,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    zIndex: 100,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    paddingVertical: 8,
  },
  suggestionsBox: {
    position: 'absolute',
    top: 58,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: 220,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionMainText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  suggestionSubText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  mapWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
  mapContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#e5e7eb',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 6,
  },
  panControlsContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  panHorizontalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  panBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  panCenterSpacer: {
    width: 36,
  },
  panUp: {
    marginBottom: 2,
  },
  panDown: {
    marginTop: 2,
  },
  confirmBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  addressDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  addressIconWrap: {
    width: 44,
    height: 44,
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  confirmHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    marginTop: 2,
  },
  confirmBtn: {
    backgroundColor: '#7c3aed',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerFixedOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainer: {
    marginBottom: 32, // Offset to make the pin point at the center target
    height: 48,
    width: 48,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
