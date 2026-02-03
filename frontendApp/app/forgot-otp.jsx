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
    View,
} from 'react-native';

export default function ForgotOTP() {
  // Temporarily disable font loading to fix hooks issue
  // const [fontsLoaded] = useFonts({
  //   Montserrat_400Regular,
  //   Montserrat_500Medium,
  //   Montserrat_600SemiBold,
  //   Montserrat_700Bold,
  //   Lato_400Regular,
  //   Lato_700Bold,
  // });

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);

  // if (!fontsLoaded) return null;

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

    // Auto focus next input
    if (value && index < 5) {
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
    if (otpCode.length !== 6) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/new-password');
    }, 1500);
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* GRADIENT */}
      <LinearGradient
        colors={['#DAD5FB', '#F3F4F6', '#FFFFFF']}
        locations={[0, 0.55, 6]}
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
            <Text style={styles.title}>Verify Code</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to your registered email
            </Text>
          </View>

          {/* FORM */}
          <View style={styles.form}>
            {/* OTP INPUT */}
            <View style={styles.otpSection}>
              <Text style={styles.otpLabel}>Verification Code</Text>
              
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
            </View>

            {/* TIMER / RESEND */}
            <View style={styles.timerContainer}>
              {!canResend ? (
                <Text style={styles.timerText}>
                  Resend code in <Text style={styles.timerBold}>{timer}s</Text>
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendText}>Didn't receive? Resend Code</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* VERIFY BUTTON */}
            <TouchableOpacity 
              onPress={handleVerify}
              style={[
                styles.continueBtn, 
                (!isOtpComplete || loading) && { opacity: 0.5 }
              ]}
              disabled={!isOtpComplete || loading}
            >
              <Text style={styles.continueText}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </Text>
            </TouchableOpacity>

            {/* HELP TEXT */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Need help?</Text>
              <TouchableOpacity>
                <Text style={styles.signupLink}> Contact Support</Text>
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
    fontWeight: '400',
    color: '#111827',
    marginBottom: 60,
    fontFamily: 'Montserrat_500Medium',
  },

  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#1A1D1B',
  },

  form: {
    gap: 18,
  },

  otpSection: {
    marginBottom: 8,
  },

  otpLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },

  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  otpInput: {
    flex: 1,
    height: 60,
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    borderRadius: 22,
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: 'transparent',
  },

  otpInputFilled: {
    borderColor: '#C4B5FD',
    backgroundColor: 'rgba(196,181,253,0.1)',
    borderWidth: 2,
  },

  timerContainer: {
    alignItems: 'center',
    marginTop: 10,
  },

  timerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },

  timerBold: {
    fontWeight: '700',
    color: '#111827',
  },

  resendText: {
    fontSize: 14,
    color: '#AFA0F8',
    fontWeight: '600',
  },

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
    fontWeight: '400',
    lineHeight: 18,
  },

  link: {
    textDecorationLine: 'underline',
    fontWeight: '700',
    color: '#374151',
  },
});