import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { showToast } from '../utils/toast';

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDiYnY4FG1juihWvHEgM-NSz2aEKUsKing';

import { MapView, PROVIDER_GOOGLE, hasNativeMap } from '../utils/mapModule';


export default function InlineMapPicker({ value, city, state, onChangeLocation }) {
  const [mapRegion, setMapRegion] = useState({
    latitude: 19.0760, // Default to Mumbai
    longitude: 72.8777,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [loading, setLoading] = useState(false);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [mapInteracting, setMapInteracting] = useState(false);

  const mapRef = useRef(null);
  const isUserDragging = useRef(false);
  const prevValRef = useRef(value);

  // 1. Fetch current GPS location coordinates
  const getCurrentLocation = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!quiet) showToast.warn('Location permissions denied. Using default location.');
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      let loc = null;

      if (!servicesEnabled) {
        if (!quiet) showToast.warn('Location services (GPS) are turned off. Please enable GPS.');
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
      const newRegion = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setMapRegion(newRegion);

      if (hasNativeMap && mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }

      await reverseGeocode(lat, lng);
    } catch (e) {
      console.log('GPS load failed/timed out:', e.message);
      if (!quiet) showToast.warn('GPS timed out. Centered on Mumbai.');
    } finally {
      setLoading(false);
    }
  };

  // On mount: fetch location if empty
  useEffect(() => {
    if (!value) {
      getCurrentLocation(true);
    } else {
      geocodeAddress(value);
    }
  }, []);

  // 2. Geocode address text to center the map
  const geocodeDebounceTimer = useRef(null);

  // 2. Geocode address text to center the map
  const geocodeAddress = async (addressText) => {
    if (!addressText || mapInteracting || isUserDragging.current) return;

    if (geocodeDebounceTimer.current) clearTimeout(geocodeDebounceTimer.current);

    geocodeDebounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressText)}&key=${API_KEY}`
        );
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          const newRegion = {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          };
          setMapRegion(newRegion);
          if (hasNativeMap && mapRef.current) {
            mapRef.current.animateToRegion(newRegion, 1000);
          }
        }
      } catch (e) {
        console.log('Geocoding error:', e);
      }
    }, 600);
  };

  // Watch for external address changes or city/state changes
  useEffect(() => {
    if (value && value !== prevValRef.current) {
      geocodeAddress(value);
      prevValRef.current = value;
    } else if (!value && (city || state)) {
      const cityStateQuery = [city, state].filter(Boolean).join(', ');
      geocodeAddress(cityStateQuery);
    }
  }, [value, city, state]);

  // Cleanup geocode timer on unmount
  useEffect(() => {
    return () => {
      if (geocodeDebounceTimer.current) clearTimeout(geocodeDebounceTimer.current);
    };
  }, []);

  // 3. Reverse Geocode (Lat/Lng -> Text Address)
  const reverseGeocode = async (lat, lng) => {
    setResolvingAddress(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        // Find the first result that is not a Plus Code
        let firstResult = data.results[0];
        for (const res of data.results) {
          const isPlusCode = res.types?.includes('plus_code') || 
                             /^[A-Z0-9]{4,8}\+[A-Z0-9]{2,}/i.test(res.formatted_address || '');
          if (!isPlusCode) {
            firstResult = res;
            break;
          }
        }
        const addrText = firstResult.formatted_address;

        let cityVal = '';
        let stateVal = '';
        let pincodeVal = '';
        if (firstResult.address_components) {
          for (const comp of firstResult.address_components) {
            const types = comp.types;
            if (types.includes('postal_code')) {
              pincodeVal = comp.long_name;
            } else if (types.includes('locality')) {
              cityVal = comp.long_name;
            } else if (types.includes('administrative_area_level_2') && !cityVal) {
              cityVal = comp.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              stateVal = comp.long_name;
            }
          }
        }

        // Fallback 1: Scan other geocoding results for postal_code component
        if (!pincodeVal && data.results && data.results.length > 0) {
          for (const res of data.results) {
            if (res.address_components) {
              const postComp = res.address_components.find(comp => comp.types.includes('postal_code'));
              if (postComp) {
                pincodeVal = postComp.long_name;
                break;
              }
            }
          }
        }

        // Fallback 2: Scan formatted address strings of all results for a 6-digit pincode using regex
        if (!pincodeVal && data.results && data.results.length > 0) {
          for (const res of data.results) {
            if (res.formatted_address) {
              const pinMatch = res.formatted_address.match(/\b\d{6}\b/);
              if (pinMatch) {
                pincodeVal = pinMatch[0];
                break;
              }
            }
          }
        }

        prevValRef.current = addrText;
        onChangeLocation(addrText, { city: cityVal, state: stateVal, pincode: pincodeVal, latitude: lat, longitude: lng });
      } else {
        const nativeAddr = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (nativeAddr.length > 0) {
          const addr = nativeAddr[0];
          const cityVal = addr.city || addr.subregion || addr.district || '';
          const street = addr.street || addr.name || '';
          const stateVal = addr.region || '';
          const pincodeVal = addr.postalCode || '';
          const addrText = [street, cityVal, stateVal].filter(Boolean).join(', ');
          prevValRef.current = addrText;
          onChangeLocation(addrText, { city: cityVal, state: stateVal, pincode: pincodeVal, latitude: lat, longitude: lng });
        }
      }
    } catch (err) {
      console.log('Reverse geocoding error:', err);
    } finally {
      setResolvingAddress(false);
      isUserDragging.current = false;
    }
  };

  const handleMapRegionChange = (region) => {
    setMapRegion(region);
  };

  const handleRegionChangeComplete = async (region) => {
    if (isUserDragging.current) {
      setMapRegion(region);
      await reverseGeocode(region.latitude, region.longitude);
    }
  };

  // Touch handlers for manual static map panning
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

      const newLat = mapRegion.latitude + latChange;
      const newLng = mapRegion.longitude - lngChange;

      const newRegion = {
        ...mapRegion,
        latitude: newLat,
        longitude: newLng,
      };
      setMapRegion(newRegion);
      await reverseGeocode(newLat, newLng);
    }
    isDragging.current = false;
  };

  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${mapRegion.latitude},${mapRegion.longitude}&zoom=15&size=500x240&scale=2&key=${API_KEY}`;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#7c3aed" />
        <Text style={styles.loadingText}>Initializing map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mapWrapper}>
      {hasNativeMap && MapView ? (
        <MapView
          ref={mapRef}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={mapRegion}
          onRegionChange={handleMapRegionChange}
          onRegionChangeComplete={handleRegionChangeComplete}
          onTouchStart={() => {
            setMapInteracting(true);
            isUserDragging.current = true;
          }}
          onTouchEnd={() => setMapInteracting(false)}
          onTouchCancel={() => setMapInteracting(false)}
          loadingEnabled
          pitchEnabled={false}
          rotateEnabled={false}
          style={styles.map}
          showsUserLocation
          showsMyLocationButton={false}
        />
      ) : (
        <View
          style={styles.mapContainer}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image source={{ uri: staticMapUrl }} style={styles.mapImage} />
        </View>
      )}

      {/* 2. Absolute overlay with pointerEvents="none" for the center pin */}
      <View pointerEvents="none" style={styles.markerFixedOverlay}>
        <View style={styles.markerContainer}>
          {resolvingAddress ? (
            <ActivityIndicator color="#7c3aed" size="small" />
          ) : (
            <Ionicons name="location-sharp" size={28} color="#7c3aed" />
          )}
        </View>
      </View>

      {/* 3. Locate Me FAB */}
      <TouchableOpacity onPress={() => getCurrentLocation()} style={styles.locateFloatingBtn}>
        <Ionicons name="locate" size={18} color="#7c3aed" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: 200,
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  loadingText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  mapWrapper: {
    height: 200,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#e5e7eb',
    position: 'relative', // CRITICAL
    marginTop: 10,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  markerFixedOverlay: {
    position: 'absolute', // CRITICAL
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainer: {
    marginBottom: 28, // Offset to point to target
    height: 40,
    width: 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2.5,
  },
  locateFloatingBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
