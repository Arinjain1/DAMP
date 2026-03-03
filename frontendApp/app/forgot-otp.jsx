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
      router.push('/new-password');
    }, 1500);
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '']);
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
          {/* BACK */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color="#333" />
          </TouchableOpacity>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>OTP</Text>
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
import styles from '../src/styles/forgotOtpStyles';