import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
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
import { useDispatch } from 'react-redux';
import { authAPI, setAuthToken } from '../src/config/api';
import { loginSuccess } from '../src/store/slices/authSlice';
import { showToast } from '../src/utils/toast';

export default function OTP() {
  const dispatch = useDispatch();
  const params = useLocalSearchParams();
  const phoneNumber = (params.phone_number || '').toString();
  const [verificationToken, setVerificationToken] = useState(
    (params.verification_token || '').toString()
  );

  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [verificationToken]);

  const handleOtpChange = (value, index) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length > 1) {
      // User pasted multi-digit OTP or auto-filled
      const pastedDigits = cleaned.slice(0, 4).split('');
      const newOtp = [...otp];
      pastedDigits.forEach((digit, i) => {
        if (index + i < 4) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextFocus = Math.min(index + pastedDigits.length, 3);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleaned.slice(-1);
    setOtp(newOtp);

    if (cleaned && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      showToast.warn('Please enter the complete 4-digit OTP');
      return;
    }

    if (!phoneNumber) {
      showToast.error('Mobile number is missing. Please login again.');
      router.replace('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyOTP({
        phone_number: phoneNumber,
        otp: otpCode,
        verification_token: verificationToken,
      });

      if (response.data && response.data.success) {
        if (response.data.isNewUser) {
          showToast.success('Mobile verified! Please complete your registration.');
          router.replace({
            pathname: '/register',
            params: {
              phone_number: response.data.phone_number || phoneNumber,
              verification_token: verificationToken,
            },
          });
        } else {
          const { user, token } = response.data;
          setAuthToken(token);
          dispatch(
            loginSuccess({
              id: user.id,
              name: user.full_name,
              full_name: user.full_name,
              email: user.email,
              phone_number: user.phone_number,
              role: user.role,
              token,
            })
          );
          showToast.success('Login successful!');
          router.replace('/dashboard');
        }
      } else {
        showToast.error(response.data?.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verify error:', error);
      const msg =
        error.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phoneNumber) return;
    try {
      const response = await authAPI.resendOTP({ phone_number: phoneNumber });
      if (response.data?.success) {
        if (response.data.verification_token) {
          setVerificationToken(response.data.verification_token);
        }
        showToast.success('New OTP sent to your phone');
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '']);
      }
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== '');
  const maskedPhone =
    phoneNumber.length >= 10
      ? `+91 ******${phoneNumber.slice(-4)}`
      : phoneNumber;

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
          {/* BACK BUTTON */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color="#333" />
          </TouchableOpacity>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>OTP Verification</Text>
            <Text style={styles.subtitle}>
              Enter the 4-digit code sent to {maskedPhone}
            </Text>
          </View>

          {/* FORM */}
          <View style={styles.form}>
            {/* OTP INPUT */}
            <View style={styles.otpInputContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  style={[styles.otpInput, digit && styles.otpInputFilled]}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* RESEND */}
            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendText}>Resend code</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>Resend code in {timer}s</Text>
              )}
            </View>

            {/* CONTINUE BUTTON */}
            <TouchableOpacity
              onPress={handleVerify}
              disabled={!isOtpComplete || loading}
              style={[
                styles.continueBtn,
                (!isOtpComplete || loading) && { opacity: 0.75 },
              ]}
            >
              <Text style={styles.continueText}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By signing up, you agree to the{' '}
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
    marginBottom: 40,
  },

  title: {
    fontSize: 32,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#111827',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 15,
    fontFamily: 'Montserrat_400Regular',
    color: '#6B7280',
    lineHeight: 22,
  },

  form: {
    gap: 24,
  },

  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },

  otpInput: {
    flex: 1,
    height: 64,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    fontSize: 24,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#111827',
  },

  otpInputFilled: {
    borderColor: '#8B5CF6',
    backgroundColor: '#FAF5FF',
  },

  resendContainer: {
    alignItems: 'center',
    marginTop: 4,
  },

  resendText: {
    fontSize: 14,
    color: '#7C3AED',
    fontFamily: 'Montserrat_600SemiBold',
  },

  timerText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Montserrat_400Regular',
  },

  continueBtn: {
    backgroundColor: '#C4B5FD',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  continueText: {
    fontSize: 16,
    color: '#111827',
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