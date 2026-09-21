import { Lato_400Regular, Lato_700Bold, useFonts } from '@expo-google-fonts/lato';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Phone } from 'lucide-react-native';
import { useState } from 'react';
import {
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

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Lato_400Regular,
    Lato_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleSendOtp = async () => {
    const clean = phoneNumber.replace(/\D/g, '').slice(-10);
    if (!clean || clean.length !== 10) {
      showToast.warn('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.sendOTP({ phone_number: clean });

      if (response.data && response.data.success) {
        showToast.success('OTP sent successfully!');
        router.push({
          pathname: '/otp',
          params: {
            phone_number: response.data.phone_number || clean,
            verification_token: response.data.verification_token,
          },
        });
      } else {
        showToast.error(response.data?.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Login Send OTP Error:', error);
      const errorMessage =
        error.response?.data?.message || 'Unable to connect to server. Please check your connection.';
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
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Enter your mobile number to receive an OTP</Text>
          </View>

          {/* FORM */}
          <View style={styles.form}>
            {/* PHONE NUMBER INPUT */}
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeBadge}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="10-digit Mobile Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            {/* SEND OTP BUTTON */}
            <TouchableOpacity
              style={[styles.continueBtn, loading && { opacity: 0.75 }]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              <Text style={styles.continueText}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Text>
            </TouchableOpacity>

            {/* SIGN UP ROW */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don&apos;t have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.signupLink}> Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to the{' '}
              <Text style={styles.link}>Terms of Service</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>.
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
    paddingTop: 60,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#15151520',
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 42,
    fontFamily: 'Montserrat_500Medium',
    fontWeight: '400',
    color: '#111827',
    marginBottom: 20,
  },

  subtitle: {
    fontSize: 15,
    fontFamily: 'Montserrat_400Regular',
    color: '#1A1D1B',
    marginBottom: 20,
  },

  form: {
    gap: 18,
  },

  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },

  countryCodeBadge: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },

  countryCodeText: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#374151',
  },

  phoneInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Lato_400Regular',
    color: '#111827',
  },

  continueBtn: {
    backgroundColor: '#C4B5FD',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
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
    marginTop: 6,
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

  link: {
    textDecorationLine: 'underline',
    fontFamily: 'Lato_700Bold',
    color: '#374151',
  },
});
