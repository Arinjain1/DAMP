import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold, useFonts } from '@expo-google-fonts/montserrat';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { authAPI } from '../src/config/api';
import { showToast } from '../src/utils/toast';



export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    location: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Lato_400Regular,
    Lato_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- UPDATED LOCATION LOGIC (No API Key Needed) ---
  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      // 1. Request Permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast.warn('Allow location access to detect your city.');
        setLocationLoading(false);
        return;
      }

      // 2. Get Coordinates
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

      // 3. Reverse Geocode (Native Device Method - Free & Fast)
      let address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (address.length > 0) {
        const addr = address[0];
        // Construct smart string: e.g., "Indore, Madhya Pradesh"
        const city = addr.city || addr.subregion || addr.district; // Fallbacks
        const region = addr.region || addr.country;

        const locationString = [city, region].filter(Boolean).join(', ');
        handleChange('location', locationString);
      } else {
        showToast.warn('Could not detect city name automatically.');
      }

    } catch (error) {
      showToast.error('Make sure Location/GPS is enabled on your device.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      showToast.warn('Please fill all required fields');
      return;
    }

    if (formData.password.length < 6) {
      showToast.warn('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Map frontend field names to backend expected names
      const registerData = {
        full_name: formData.name,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone,
        age: formData.age ? parseInt(formData.age) : null,
        city: formData.location || ''
      };

      const response = await authAPI.register(registerData);

      if (response.data) {
        showToast.success('Account created! Please login.');
        setTimeout(() => router.replace('/login'), 1500);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Unable to connect to server. Please check your connection.';
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* GRADIENT */}
      <LinearGradient
        colors={['#DAD5FB', '#F3F4F6', '#FFFFFF']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* BACK */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color="#333" />
          </TouchableOpacity>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          {/* FORM */}
          <View style={styles.form}>
            {/* NAME */}
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(v) => handleChange('name', v)}
              placeholder="Full Name"
              placeholderTextColor="#9CA3AF"
            />

            {/* EMAIL */}
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(v) => handleChange('email', v)}
              placeholder="Email Address"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* PHONE & AGE ROW */}
            <View style={styles.rowContainer}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                value={formData.phone}
                onChangeText={(v) => handleChange('phone', v)}
                placeholder="Phone"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                value={formData.age}
                onChangeText={(v) => handleChange('age', v)}
                placeholder="Age"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={2}
              />
            </View>

            {/* LOCATION */}
            <View style={styles.locationContainer}>
              <TextInput
                style={styles.locationInput}
                value={formData.location}
                onChangeText={(v) => handleChange('location', v)}
                placeholder="City, State"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={handleGetLocation}
                disabled={locationLoading}
                style={styles.gpsButton}
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.gpsText}>GPS</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* PASSWORD */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.password}
                onChangeText={(v) => handleChange('password', v)}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>

            {/* BUTTON */}
            <TouchableOpacity
              style={[styles.continueBtn, loading && { opacity: 0.75 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.continueText}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            {/* LOGIN LINK */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.signupLink}> Log In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By signing up, you agree to the{' '}
              <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
              <Text style={styles.footerLink}>Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 33,
    paddingTop: 57,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#15151520',
  },

  header: {
    marginBottom: 15,
  },

  title: {
    fontSize: 42,
    fontFamily: 'Montserrat_500Medium',
    fontWeight: '400',
    color: '#111827',
    marginBottom: 30,
  },

  subtitle: {
    fontSize: 15,
    fontFamily: 'Montserrat_400Regular',
    color: '#1A1D1B',
  },

  form: {
    gap: 18,
  },

  input: {
    height: 50,
    borderRadius: 22,
    paddingHorizontal: 22,
    fontSize: 16,
    fontFamily: 'Lato_400Regular',
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    color: '#111827',
  },

  rowContainer: {
    flexDirection: 'row',
    gap: 10,
  },

  halfInput: {
    flex: 1,
  },

  locationContainer: {
    position: 'relative',
  },

  locationInput: {
    height: 50,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingRight: 80,
    fontSize: 16,
    fontFamily: 'Lato_400Regular',
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    color: '#111827',
  },

  gpsButton: {
    position: 'absolute',
    right: 7,
    top: 6,
    backgroundColor: '#C4B5FD',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  gpsText: {
    color: '#111827',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },

  passwordContainer: {
    position: 'relative',
  },

  passwordInput: {
    height: 50,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingRight: 60,
    fontSize: 16,
    fontFamily: 'Lato_400Regular',
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    color: '#111827',
  },

  eyeButton: {
    position: 'absolute',
    right: 20,
    top: 14,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  terms: {
    fontSize: 12,
    textAlign: 'center',
    color: '#6B7280',
    fontFamily: 'Lato_400Regular',
    marginTop: 8,
  },

  link: {
    textDecorationLine: 'underline',
    fontFamily: 'Lato_700Bold',
    color: '#374151',
  },

  continueBtn: {
    backgroundColor: '#C4B5FD',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 56,
  },

  continueText: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Montserrat_600SemiBold',
  },

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },

  signupText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Montserrat_400Regular',
  },

  signupLink: {
    fontSize: 14,
    color: '#AFA0F8',
    fontFamily: 'Montserrat_600SemiBold',
  },

  footer: {
    marginTop: 'auto',
    marginBottom: 28,
    paddingHorizontal: 10,
  },

  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Lato_400Regular',
    lineHeight: 18,
  },

  footerLink: {
    textDecorationLine: 'underline',
    fontFamily: 'Lato_700Bold',
    color: '#374151',
  },
});