import { loginSuccess } from '@/src/store/slices/authSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Shield } from 'lucide-react-native';
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
    Dimensions,
} from 'react-native';
import { useDispatch } from 'react-redux';

const { height } = Dimensions.get('window');

export default function OTP() {
  const dispatch = useDispatch();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
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
    setOtp(['', '', '', '', '', '']);
    console.log('Resending OTP...');
  };

  const handleBack = () => {
    router.back();
  };

  const isOtpComplete = otp.every(digit => digit !== '');

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
            {/* BACK BUTTON */}
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={22} color="#111827" strokeWidth={2.5} />
            </TouchableOpacity>

            {/* HEADER */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.brokerText}>BROKER</Text>
                <View style={styles.numberBadge}>
                  <Text style={styles.numberText}>99</Text>
                </View>
              </View>

              <View style={styles.iconWrapper}>
                <Shield size={28} color="#BFB7FD" strokeWidth={2.5} />
              </View>

              <Text style={styles.title}>Verify Your Phone</Text>
              <Text style={styles.subtitle}>
                We've sent a 6-digit code to{'\n'}
                <Text style={styles.phoneNumber}>+91 98765 43210</Text>
              </Text>
            </View>

            {/* FORM */}
            <View style={styles.form}>
              {/* OTP INPUT */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Verification Code</Text>
                
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

              {/* TIMER */}
              <View style={styles.timerContainer}>
                {!canResend ? (
                  <Text style={styles.timerText}>
                    Resend code in {timer}s
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResend}>
                    <Text style={styles.resendText}>Resend Code</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* VERIFY BUTTON */}
              <TouchableOpacity 
                onPress={handleVerify}
                disabled={!isOtpComplete || loading}
                activeOpacity={0.85}
                style={[
                  styles.verifyBtn,
                  (!isOtpComplete || loading) && { opacity: 0.5 }
                ]}
              >
                <LinearGradient
                  colors={['#BFB7FD', '#A89EF8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBtn}
                >
                  <Text style={styles.verifyText}>
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* FOOTER */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Didn't receive the code?</Text>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Contact Support</Text>
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
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  /* BACK BUTTON */
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 50,
    left: 24,
    zIndex: 10,
    padding: 8,
  },

  /* HEADER */
  header: {
    alignItems: 'center',
    marginTop: height * 0.08,
    marginBottom: 28,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  brokerText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 0.8,
  },
  numberBadge: {
    backgroundColor: '#BFB7FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  numberText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(191, 183, 253, 0.4)',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 5,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 19,
  },
  phoneNumber: {
    fontWeight: '700',
    color: '#111827',
  },

  /* FORM */
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  otpInput: {
    width: 44,
    height: 52,
    borderWidth: 1.5,
    borderColor: 'rgba(191, 183, 253, 0.3)',
    borderRadius: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  otpInputFilled: {
    borderColor: '#BFB7FD',
    backgroundColor: 'rgba(191, 183, 253, 0.15)',
  },

  /* TIMER */
  timerContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  timerText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  resendText: {
    fontSize: 12,
    color: '#9F95F5',
    fontWeight: '700',
  },

  /* BUTTON */
  verifyBtn: {
    marginTop: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientBtn: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* FOOTER */
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 14,
  },
  footerText: {
    fontSize: 13,
    color: '#6b7280',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9F95F5',
  },
});