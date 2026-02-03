import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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
    View
} from 'react-native';

import { useDispatch } from 'react-redux';
import { loginSuccess } from '../src/store/slices/authSlice';

export default function ResetOTP() {
  const dispatch = useDispatch();
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
  }, []);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
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
    if (otpCode.length !== 4) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const userData = {
        id: 1,
        name: 'Rajesh Sharma',
        email: 'rajesh@example.com',
        phone: '+91 98765 43210'
      };
      dispatch(loginSuccess(userData));
    }, 1500);
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '']);
    console.log('Resending Reset OTP...');
  };

  const handleBack = () => {
    router.back();
  };

  const isOtpComplete = otp.every(digit => digit !== '');

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
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={22} color="#333" />
          </TouchableOpacity>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Reset OTP</Text>
            <Text style={styles.subtitle}>Enter code</Text>
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
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled
                  ]}
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
                <Text style={styles.timerText}>
                  Resend code in {timer}s
                </Text>
              )}
            </View>

            {/* CONTINUE BUTTON */}
            <TouchableOpacity 
              onPress={handleVerify}
              disabled={!isOtpComplete || loading}
              style={[
                styles.continueBtn,
                (!isOtpComplete || loading) && { opacity: 0.75 }
              ]}
            >
              <Text style={styles.continueText}>
                {loading ? 'Processing...' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By resetting your password, you agree to the{' '}
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

  /* BACK BUTTON */
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

  /* HEADER */
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontFamily: 'Montserrat_500Medium',
    fontWeight: '400',
    color: '#111827',
    marginBottom: 60,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Montserrat_400Regular',
    color: '#1A1D1B',
  },

  /* FORM */
  form: {
    gap: 18,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    gap: 12,
    marginTop: 20,
  },
  otpInput: {
    flex: 1,
    height: 60,
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    borderRadius: 22,
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: 'transparent',
    fontFamily: 'Montserrat_600SemiBold',
  },
  otpInputFilled: {
    borderColor: '#C4B5FD',
    backgroundColor: 'rgba(196, 181, 253, 0.1)',
  },

  /* RESEND */
  resendContainer: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  timerText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '400',
    fontFamily: 'Montserrat_400Regular',
  },
  resendText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },

  /* BUTTON */
  continueBtn: {
    backgroundColor: '#C4B5FD',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 66,
  },
  continueText: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Montserrat_600SemiBold',
  },

  /* FOOTER */
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