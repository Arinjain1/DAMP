import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Shield } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { height } = Dimensions.get('window');

export default function ForgotOTP() {
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

    console.log('🔥 OTP Verify clicked, OTP:', otpCode);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('🔥 Navigating to /new-password');
      router.push('/new-password');
    }, 1500);
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    console.log('Resending Reset OTP...');
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
          <View style={styles.container}>
            
            {/* BACK BUTTON */}
            <TouchableOpacity 
              onPress={handleBack} 
              style={styles.backButton}
            >
              <ArrowLeft size={20} color="#111827" />
            </TouchableOpacity>

            {/* HEADER */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Shield size={48} color="#111827" />
              </View>
              <Text style={styles.title}>Verify Code</Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit code sent to{'\n'}your registered email
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
                  styles.verifyButton, 
                  (!isOtpComplete || loading) && { opacity: 0.5 }
                ]}
                disabled={!isOtpComplete || loading}
                activeOpacity={0.85}
              >
                <Text style={styles.verifyButtonText}>
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </Text>
              </TouchableOpacity>

              {/* HELP TEXT */}
              <View style={styles.helpContainer}>
                <Text style={styles.helpText}>
                  Need help?{' '}
                  <Text style={styles.helpLink}>Contact Support</Text>
                </Text>
              </View>

            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
    paddingBottom: 40,
  },

  /* BACK BUTTON */
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: '#D6D3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  /* HEADER */
  header: {
    alignItems: 'center',
    marginTop: height * 0.05,
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },

  /* FORM */
  form: {
    gap: 20,
  },

  /* OTP SECTION */
  otpSection: {
    marginBottom: 8,
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: '#D6D3FF',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  otpInputFilled: {
    borderColor: '#BFB7FD',
    backgroundColor: 'rgba(191,183,253,0.1)',
    borderWidth: 2,
  },

  /* TIMER */
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  timerBold: {
    fontWeight: '800',
    color: '#111827',
  },
  resendText: {
    fontSize: 13,
    color: '#4f46e5',
    fontWeight: '800',
  },

  /* VERIFY BUTTON */
  verifyButton: {
    backgroundColor: '#bfb7fd',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* HELP */
  helpContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
  },
  helpLink: {
    color: '#4f46e5',
    fontWeight: '800',
  },
});