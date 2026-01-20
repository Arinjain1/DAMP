import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Location from 'expo-location'; // Requires: npx expo install expo-location
import { Calendar, Eye, EyeOff, Lock, Mail, MapPin, Phone, User, ArrowRight, UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator
} from 'react-native';

const { height } = Dimensions.get('window');

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
        Alert.alert('Permission Denied', 'Allow location access to detect your city.');
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
        Alert.alert('Try Again', 'Could not detect city name automatically.');
      }

    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Make sure Location/GPS is enabled on your device.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleRegister = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/otp');
    }, 1200);
  };

  // Theme Colors
  const iconColor = "#BFB7FD"; 
  const placeholderColor = "#9CA3AF";

  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <LinearGradient
        colors={['#BFB7FD', '#E5E1FF', '#ffffff']}
        locations={[0, 0.55, 1]}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* HEADER (Compact) */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <UserPlus size={48} color="#111827" />
              </View>
              <Text style={styles.title}>Broker 99</Text>
              <Text style={styles.subtitle}>Create your account</Text>
            </View>

            {/* FORM (Compact & Transparent) */}
            <View style={styles.form}>
              
              {/* NAME */}
              <View style={styles.inputBox}>
                <User size={18} color={iconColor} />
                <TextInput
                  value={formData.name}
                  onChangeText={(v) => handleChange('name', v)}
                  placeholder="Full Name"
                  placeholderTextColor={placeholderColor}
                  style={styles.input}
                />
              </View>

              {/* EMAIL */}
              <View style={styles.inputBox}>
                <Mail size={18} color={iconColor} />
                <TextInput
                  value={formData.email}
                  onChangeText={(v) => handleChange('email', v)}
                  placeholder="Email Address"
                  placeholderTextColor={placeholderColor}
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              {/* PHONE & AGE ROW */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.inputBox, { flex: 2 }]}>
                  <Phone size={18} color={iconColor} />
                  <TextInput
                    value={formData.phone}
                    onChangeText={(v) => handleChange('phone', v)}
                    placeholder="Phone"
                    placeholderTextColor={placeholderColor}
                    keyboardType="phone-pad"
                    style={styles.input}
                  />
                </View>
                <View style={[styles.inputBox, { flex: 1 }]}>
                  <Calendar size={18} color={iconColor} />
                  <TextInput
                    value={formData.age}
                    onChangeText={(v) => handleChange('age', v)}
                    placeholder="Age"
                    placeholderTextColor={placeholderColor}
                    keyboardType="numeric"
                    maxLength={2}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* LOCATION (With Native GPS Button) */}
              <View style={styles.inputBox}>
                <MapPin size={18} color={iconColor} />
                <TextInput
                  value={formData.location}
                  onChangeText={(v) => handleChange('location', v)}
                  placeholder="City, State"
                  placeholderTextColor={placeholderColor}
                  style={styles.input}
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
              <View style={styles.inputBox}>
                <Lock size={18} color={iconColor} />
                <TextInput
                  value={formData.password}
                  onChangeText={(v) => handleChange('password', v)}
                  placeholder="Password"
                  placeholderTextColor={placeholderColor}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} color={iconColor} /> : <Eye size={18} color={iconColor} />}
                </TouchableOpacity>
              </View>

              {/* TERMS */}
              <Text style={styles.terms}>
                Agreed to <Text style={styles.link}>Terms</Text> & <Text style={styles.link}>Privacy</Text>
              </Text>

              {/* BUTTON */}
              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
                style={[styles.registerBtn, loading && { opacity: 0.7 }]}
              >
                <Text style={styles.registerText}>
                  {loading ? 'Creating...' : 'Sign Up'}
                </Text>
                {!loading && <ArrowRight size={18} color="white" />}
              </TouchableOpacity>

              {/* LOGIN LINK */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Existing user?</Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.footerLink}>Log In</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 20,
  },

  /* HEADER */
  header: {
    alignItems: 'center',
    marginBottom: 24, 
    marginTop: height * 0.05, 
  },
  logoContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '500',
  },

  /* FORM */
  form: {
    gap: 12, 
  },
  
  // Glassmorphism Input
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)', 
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44, 
    borderWidth: 1,
    borderColor: '#D6D3FF',
    gap: 10,
    
  },
  input: {
    flex: 1,
    fontSize: 14, 
    fontWeight: '600',
    color: '#111827',
    height: '100%',
    backgroundColor: 'transparent',
  },
  
  // GPS Button
  gpsButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  gpsText: {
    color: '#BFB7FD',
    fontSize: 10,
    fontWeight: '800',
  },

  /* TERMS */
  terms: {
    fontSize: 11,
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 4,
  },
  link: {
    color: '#111827',
    fontWeight: '700',
  },

  /* BUTTON */
  registerBtn: {
    marginTop: 8,
    backgroundColor: '#bfb7fd',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    
  },
  registerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* FOOTER */
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4f46e5',
  },
});