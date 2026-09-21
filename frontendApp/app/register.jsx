import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  useFonts,
} from '@expo-google-fonts/montserrat';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
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
import { useDispatch } from 'react-redux';
import { authAPI, setAuthToken } from '../src/config/api';
import { loginSuccess } from '../src/store/slices/authSlice';
import { showToast } from '../src/utils/toast';

export default function Register() {
  const dispatch = useDispatch();
  const params = useLocalSearchParams();
  const initialPhone = (params.phone_number || '').toString();
  const verificationToken = (params.verification_token || '').toString();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: initialPhone,
    age: '',
    location: '',
  });

  useEffect(() => {
    if (params.phone_number) {
      setFormData((prev) => ({ ...prev, phone: params.phone_number.toString() }));
    }
  }, [params.phone_number]);

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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast.warn('Allow location access to detect your city.');
        setLocationLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;

      const API_KEY =
        process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
        'AIzaSyDiYnY4FG1juihWvHEgM-NSz2aEKUsKing';
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        let cityVal = '';
        for (const component of data.results[0].address_components) {
          const types = component.types;
          if (types.includes('locality')) {
            cityVal = component.long_name;
            break;
          } else if (types.includes('administrative_area_level_2') && !cityVal) {
            cityVal = component.long_name;
          }
        }

        if (cityVal) {
          handleChange('location', cityVal);
        } else {
          showToast.warn('Could not detect city name.');
        }
      } else {
        showToast.warn('Could not detect location from GPS.');
      }
    } catch (error) {
      console.error('Location detection error:', error);
      showToast.error('Make sure Location/GPS is enabled on your device.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleRegister = async () => {
    const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);

    if (!formData.name || !cleanPhone || cleanPhone.length !== 10) {
      showToast.warn('Please enter full name and a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      // If user has not verified OTP yet, send OTP first
      if (!verificationToken) {
        const otpRes = await authAPI.sendOTP({ phone_number: cleanPhone });
        if (otpRes.data && otpRes.data.success) {
          showToast.success('OTP sent to your mobile number!');
          router.push({
            pathname: '/otp',
            params: {
              phone_number: cleanPhone,
              verification_token: otpRes.data.verification_token,
            },
          });
          return;
        }
      }

      // If phone is already verified with verification_token:
      const registerData = {
        full_name: formData.name.trim(),
        email: formData.email.trim(),
        phone_number: cleanPhone,
        age: formData.age ? parseInt(formData.age, 10) : null,
        city: formData.location || '',
        verification_token: verificationToken,
      };

      const response = await authAPI.register(registerData);

      if (response.data && response.data.success) {
        const token = response.data.token;
        setAuthToken(token);
        dispatch(
          loginSuccess({
            id: response.data.id,
            name: response.data.full_name,
            full_name: response.data.full_name,
            email: response.data.email,
            phone_number: response.data.phone_number,
            role: response.data.role,
            token,
          })
        );
        showToast.success('Account created successfully!');
        router.replace('/dashboard');
      } else {
        showToast.error(response.data?.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage =
        error.response?.data?.message || 'Unable to connect to server. Please try again.';
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
            <Text style={styles.subtitle}>
              {verificationToken ? 'Complete your broker profile' : 'Create your account with OTP'}
            </Text>
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

            {/* PHONE & AGE ROW */}
            <View style={styles.rowContainer}>
              <View style={[styles.phoneInputContainer, styles.halfInput]}>
                <Text style={styles.codeText}>+91</Text>
                <TextInput
                  style={styles.phoneInnerInput}
                  value={formData.phone}
                  onChangeText={(v) => handleChange('phone', v)}
                  placeholder="Mobile"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!verificationToken}
                />
              </View>
              <TextInput
                style={[styles.input, styles.quarterInput]}
                value={formData.age}
                onChangeText={(v) => handleChange('age', v)}
                placeholder="Age"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={2}
              />
            </View>

            {/* EMAIL */}
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(v) => handleChange('email', v)}
              placeholder="Email Address (Optional)"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* LOCATION */}
            <View style={styles.locationContainer}>
              <TextInput
                style={styles.locationInput}
                value={formData.location}
                onChangeText={(v) => handleChange('location', v)}
                placeholder="City"
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

            {/* BUTTON */}
            <TouchableOpacity
              style={[styles.continueBtn, loading && { opacity: 0.75 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.continueText}>
                {loading
                  ? 'Processing...'
                  : verificationToken
                  ? 'Complete Registration'
                  : 'Get OTP & Register'}
              </Text>
            </TouchableOpacity>

            {/* LOGIN LINK */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
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
    marginBottom: 16,
  },

  subtitle: {
    fontSize: 15,
    fontFamily: 'Montserrat_400Regular',
    color: '#6B7280',
    marginBottom: 10,
  },

  form: {
    gap: 16,
  },

  input: {
    height: 52,
    borderRadius: 20,
    paddingHorizontal: 20,
    fontSize: 15,
    fontFamily: 'Lato_400Regular',
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    color: '#111827',
  },

  rowContainer: {
    flexDirection: 'row',
    gap: 10,
  },

  halfInput: {
    flex: 2.2,
  },

  quarterInput: {
    flex: 1,
  },

  phoneInputContainer: {
    height: 52,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  codeText: {
    fontSize: 15,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#4B5563',
    marginRight: 8,
  },

  phoneInnerInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontFamily: 'Lato_400Regular',
    color: '#111827',
  },

  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },

  locationInput: {
    flex: 1,
    height: 52,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingRight: 75,
    fontSize: 15,
    fontFamily: 'Lato_400Regular',
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    color: '#111827',
  },

  gpsButton: {
    position: 'absolute',
    right: 6,
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  gpsText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },

  continueBtn: {
    backgroundColor: '#C4B5FD',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
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
    marginTop: 4,
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
    paddingTop: 20,
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